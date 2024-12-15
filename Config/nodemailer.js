import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: "jayeolajeremiah@gmail.com",
    pass: "gawt ngpe xpck luab",
  }
});

export default transporter