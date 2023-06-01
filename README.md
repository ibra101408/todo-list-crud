# todo-list-crud

## HTTPS SSL certificate generation:
### Creating an SSL Certificate
To configure an SSL certificate, you can either use a public, trusted certificate or a self-signed certificate.

### Creating self-signed certificate (for testing)
- First, generate a key file to use
```
openssl genrsa -out key.pem
```
- Next, generate a certificate signing request (CSR)
```
openssl req -new -key key.pem -out csr.pem
```

- Finally, generate your certificate by providing the private key
```
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
```
## Installation
- run `npm install` in the root directory
- run `npx prisma db push` in the root directory

## Running
- run `npm start` in the root directory
- open `localhost:8080` in your browser




