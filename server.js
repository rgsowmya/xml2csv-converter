const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const fs = require('fs');
const { transform } = require('camaro');
const moment = require('moment');

// Configure Views
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(fileUpload());

// Routes
app.get('/', function (req, res) {
    res.render('index');
})

app.post('/', function(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // Name of the input field (i.e. "uploadedFile") is used to retrieve the uploaded file
    let uploadedFile = req.files.uploadedFile.data;
    // res.render('index');

    // Store the uploaded file to "input" folder
    fs.writeFileSync('./input/Invoice.xml', uploadedFile);

    xml2Csv();

    async function xml2Csv() {

        // Read XML file
        const xml_file = fs.readFileSync('input/Invoice.xml', 'utf-8');

        // Template for JSON intermediate output
        const json_template = {

        // Basic Invoice Details
        invoice_type_code: 'Finvoice/InvoiceDetails/InvoiceTypeCode',
        amount_currency_identifier: 'Finvoice/InvoiceDetails/InvoiceTotalVatAmount/@AmountCurrencyIdentifier',
        buyer_party_identifier: 'Finvoice/BuyerPartyDetails/BuyerPartyIdentifier',
        payment_overdue_fine_percent: 'Finvoice/InvoiceDetails/PaymentTermsDetails/PaymentOverDueFineDetails/PaymentOverDueFinePercent',
        invoice_date: 'Finvoice/InvoiceDetails/InvoiceDate',

        // Buyer Details
        buyer_organization: 'Finvoice/BuyerPartyDetails/BuyerOrganisationName',
        buyer_streetname: 'Finvoice/BuyerPartyDetails/BuyerPostalAddressDetails/BuyerStreetName',
        buyer_postcode: 'Finvoice/BuyerPartyDetails/BuyerPostalAddressDetails/BuyerPostCodeIdentifier',
        buyer_townname: 'Finvoice/BuyerPartyDetails/BuyerPostalAddressDetails/BuyerTownName',
        buyer_countrycode: 'Finvoice/BuyerPartyDetails/BuyerPostalAddressDetails/CountryCode',

        // Delivery Details
        delivery_organization: 'Finvoice/DeliveryPartyDetails/DeliveryOrganisationName',
        delivery_streetname: 'Finvoice/DeliveryPartyDetails/DeliveryPostalAddressDetails/DeliveryStreetName',
        delivery_postcode: 'Finvoice/DeliveryPartyDetails/DeliveryPostalAddressDetails/DeliveryPostCodeIdentifier',
        delivery_townname: 'Finvoice/DeliveryPartyDetails/DeliveryPostalAddressDetails/DeliveryTownName',
        delivery_countrycode: 'Finvoice/DeliveryPartyDetails/DeliveryPostalAddressDetails/CountryCode',

        // Extra Info
        invoice_free_text: 'Finvoice/InvoiceDetails/InvoiceFreeText',
        //there is a "2" at the end of line 1 in csv-file... it's total number of <InvoiceRow>
            //we need to use an incrementor in forEach to check the total number of <InvoiceRow> and write it to the csv file

        // Item(s) Purchased
        invoice: [ '//InvoiceRow', {
            article_name: 'ArticleName',
            article_identifier: 'ArticleIdentifier',
            ordered_quantity: 'OrderedQuantity',
            unit_price_unitcode: 'UnitPriceAmount/@UnitPriceUnitCode',
            unit_price_amount: 'UnitPriceAmount',
            //change 'unit_price_amount" from float to int...when writing to csv file
            row_vat_rate_percent: 'RowVatRatePercent',
        }],
        };

        // Dictionary for storing values converted from XML TO JSON
        const dictionary = await transform (xml_file, json_template);

        // New Object to store Invoice details
        const purchased_item = dictionary.invoice;

        let invoice_items = "";
        let total_invoice_items = 0;

        // Reading details of all invoiced item
        purchased_item.forEach(value => {
            invoice_items += `;${value.article_name};${value.article_identifier};${value.ordered_quantity};${value.unit_price_unitcode};${value.unit_price_amount};;${value.row_vat_rate_percent};\n`;
            total_invoice_items++;
        })

        // Change date format of "invoicedate"
        const invoicedate = moment(dictionary.invoice_date).format('DD.M.YYYY');

        let invoice_details = `${dictionary.invoice_type_code};${dictionary.amount_currency_identifier};;;${dictionary.buyer_party_identifier};;${dictionary.buyer_organization};;;;;${dictionary.payment_overdue_fine_percent};${invoicedate};;;;${dictionary.buyer_organization}\\${dictionary.buyer_streetname}\\${dictionary.buyer_postcode}\\${dictionary.buyer_townname}\\${dictionary.buyer_countrycode};${dictionary.delivery_organization}\\${dictionary.delivery_streetname}\\${dictionary.delivery_postcode}\\${dictionary.delivery_townname}\\${dictionary.delivery_countrycode};${dictionary.invoice_free_text};;;;;;;${total_invoice_items};\n`;

        const final_invoice = `${invoice_details}${invoice_items}`;

        // Write CSV file to "output" folder
        fs.writeFileSync('./output/Invoice.csv', final_invoice);

        // CSV file downloaded to "Download" folder
        res.download('./output/Invoice.csv');
    }
});

app.listen(3000, function() {
    console.log('App listening on port 3000');
})