import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { cat = 'general', page = 1, search = '' } = req.query;

  const apiUrl = `https://newsapi.org/v2/top-headlines?country=us&category=${cat}&apiKey=${apiKey}&pageSize=20`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Proxy error' });
  }
}
