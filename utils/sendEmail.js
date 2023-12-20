const nodemailer = require("nodemailer");;

module.exports = ( to, subject, html, ) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    });

    const options = {
        from: process.env.EMAIL,
        to: to,
        subject: subject,
        html: html
    };

    transporter.sendMail(options, (err, info) => {
        if (err) {
            res.status(500).json({ msg: 'Something Went Wrong Please Try Again' })
            console.log(err);
        }
        else
            res.status(200).json({ msg: `Email Sent To: ${email}` })
    })
}