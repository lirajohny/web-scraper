// Imports the necessary dependencies
import express from 'express';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import cors from 'cors';

// creates express app
const app = express();
const PORT = 3000;

// configure middleware
app.use(express.json());
// Enabling CORS to allow requests from the frontend
app.use(cors());

// amazon web scraping funcition 
async function scrapeAmazon(keyword) {
  try {
    // builds a search URL 
    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`;

    // headers config to simulate a browser (avoid block)
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept-Language': 'en-US,en;q-0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Referer': 'https://www.amazon.com/'
    };

    console.log(`Searching results for: ${keyword}`);

    // making the HTTP request to get the HTML of the results page 
    const response = await axios.get(searchUrl, { headers });

    // Verify if the request was successful
    if (response.status !== 200) {
      throw new Error(`Failed to search for results. Status: ${response.status}`);
    }
    // Using JSDOM to analyze the html
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    // Array to store found products
    const products = [];

    // Extract products info 
    const productElements = document.querySelectorAll('div[data-component-type="s-search-result"]');
    console.log(`Found ${productElements.length} products elements`);

    // Iterates over each product element to extract information
    productElements.forEach((element) => {
      try {
        // extracting title 
        const titleElement = element.querySelector('h2 a span');
        const title = titleElement ? titleElement.textContent.trim() : 'Title not available';

        // extracting rating (stars)
        const ratingElement = element.querySelector('i.a-icon-star-small span');
        const rating = ratingElement ? ratingElement.textContent.trim() : 'No evaluation';

        // extracting number of reviews 
        const reviewCountElement = element.querySelector('span.a-size-base.s-underline-text');
        const reviewCount = reviewCountElement ? reviewCountElement.textContent.trim() : '0';

        // extracting the product image URL
        const imageElement = element.querySelector('img.s-image');
        const imageUrl = imageElement ? imageElement.getAttribute('src') : '';

        // Adding product to array 
        products.push({
          title,
          rating,
          reviewCount,
          imageUrl
        });
      } catch (err) {
        console.error('Error while extracting product information: ', err);
      }

    });
    console.log(`${products.length} processed successfully`);

    return products;

  } catch (error) {
    console.error('Error while scraping', error);
    throw error;
  }
};

// Defines endpoint to start scraping 
app.get('/api/scrape', async (req, res) => {
  try {
    // Obtains keyword from query string 
    const { keyword } = req.query;

    // verify if kw was given 
    if (!keyword) {
      return res.status(400).json({
        error: 'Keyword must not be empty. Use ?keyword=typesomething'
      });
    }

    // scraping
    const products = await scrapeAmazon(keyword);

    // Return results
    res.json({
      success: true,
      keyword,
      count: products.length,
      products
    });

  } catch (error) {
    // error handling
    console.error('Endpoint error', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform scraping',
      message: error.message
    });
  }
});

// initialize server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Scraping endpoint available at http://localhost:${PORT}/api/scrape?keyword=your-keyword`);
});



// Defines a basic route to test 
app.get('/', (req, res) => {
  res.json({ message: 'Amazon Scraper API working' });
});


