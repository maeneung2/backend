import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('정상작동중');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
