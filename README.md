# XML2CSV Converter

This application converts XML files to CSV format specifically for Finago Procountor software.

### Technologies & Libraries Used

- NodeJS
  - File System
- Express
- Express FileUploade
- EJS
- Camaro
- Moment

## Available Scripts

### `npm install`

After cloning this repository, run this command to install all the package dependencies.<br>
PS: Only run once

### `npm run dev`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view the app in browser.

## Usage

Make sure you have [NodeJS](https://nodejs.org/en/) installed in your machine. 

After running `npm install`, `npm run dev` and opening the [http://localhost:3000](http://localhost:3000), upload **exampleInvoice.xml** and click on **Convert To CSV** button.

You'll receive a converted **Invoice.csv** file in your Downloads folder, which can be used to verify the correctness of output in Procounter.
