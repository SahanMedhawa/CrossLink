const axios = require('axios');

// @desc    Get CSR-related news from external API (Secure Proxy)
// @route   GET /api/corporate/news/csr
// @access  Public
exports.getCSRNews = async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    
    if (!apiKey) {
      console.error('❌ NEWS_API_KEY is missing in .env');
      return res.status(500).json({ 
        success: false, 
        message: 'News API Key not configured on server' 
      });
    }

    // Fetch from NewsAPI using your secure key
    const response = await axios.get(
      'https://newsapi.org/v2/everything',
      {
        params: {
          q: '(CSR OR "corporate social responsibility" OR sustainability)',
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 5
        },
        headers: { 'X-Api-Key': apiKey }
      }
    );

    res.json({
      success: true,
      count: response.data.articles.length,
      data: response.data.articles
    });

  } catch (error) {
    console.error('❌ News API Proxy Error:', error.message);
    
    // Return fallback data so UI doesn't break
    res.json({
      success: true,
      count: 2,
      data: [
        { 
          title: "Global CSR Trends 2026", 
          description: "Companies are shifting focus to direct community impact...", 
          source: { name: "CSR World" }, 
          url: "#", 
          publishedAt: new Date().toISOString(), 
          urlToImage: "https://via.placeholder.com/400x200?text=News" 
        },
        { 
          title: "Climate Action: Corporate Pledges", 
          description: "New initiatives launched globally...", 
          source: { name: "Green Business" }, 
          url: "#", 
          publishedAt: new Date().toISOString(), 
          urlToImage: "https://via.placeholder.com/400x200?text=News" 
        }
      ]
    });
  }
};