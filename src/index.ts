import { Http2ServerRequest, Http2ServerResponse } from "http2";
import apiRoutes from './routes/index';
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

app.use(express.json())
app.get('/', (req: Http2ServerRequest, res : Http2ServerResponse) => {
    res.end('Hello from M S Organics')
})

app.use('/api', apiRoutes);



app.listen(PORT, () => {
    console.log('Server is listening at ', PORT);
})