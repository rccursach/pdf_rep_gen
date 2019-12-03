module.exports = (req, res, next) => {

  const api_key = process.env.API_KEY;

  if (req.header('API-KEY') !== api_key || api_key === undefined) {
    return res.status(401).send({
      message: 'Unauthorized'
    });
  } else {
    next();
  }
}