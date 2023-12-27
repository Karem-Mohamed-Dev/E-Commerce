## Description
This API provides endpoints for accessing E-Commerce functionalities, including roles, products, search, payments and more.

- For More Details About End Points: https://documenter.getpostman.com/view/27899740/2s9YkuXxNe#e46747c4-d61f-4b6e-a70c-4653ce99fb84

### Prerequisites
    - "bcrypt": "^5.1.1",
    - "cloudinary": "^1.41.1",
    - "cors": "^2.8.5",
    - "dotenv": "^16.3.1",
    - "express": "^4.18.2",
    - "helmet": "^7.1.0",
    - "jsonwebtoken": "^9.0.2",
    - "mongoose": "^8.0.3",
    - "morgan": "^1.10.0",
    - "multer": "^1.4.5-lts.1",
    - "nodemailer": "^6.9.7",
    - "stripe": "^14.10.0",
    - "validator": "^13.11.0"

## Features
- Role based project ( Admin | Seller | User)
- Image Upload With Clodinary
- Payment With Stripe

### User
- Login ( We Send Activation Link To User Email If Not Activated )
- Register ( We Send Activation Link To User Email )
- Update Info
- Change Password
- Delete Account
- Add Favourits
- Review Product || UnReview Product || Delete Review
- Report Product
- Add To Cart || Remove from Cart
- Applay Discount Coupon
- Order With Cash And Card Payment Gateway || Get Orders || Get Single Order Details

## Seller
- Login ( We Send Activation Link To User Email If Not Activated )
- Register ( We Send Activation Link To User Email )
- Forget Password
- Update Info
- Change Password
- Delete Account
- Profile
- Add Product
- Update
- Delete

## Admin
- Login
- Register ( Must Be Add By Existed Admin )
- Forget Password
- Update Info
- Change Password
- Delete Account
- Ban Seller || UnBan Seller || Get Banned Sellers | (Send Ban Content To Seller Email)
- Warn Seller || UnWarn Seller || Get Warned Sellers | (Send Warn Content To Seller Email)
- See Users Reports
- Create Coupon || Update Coupon || Delete Coupon
- Create Category || Update Category || Delete Category
- Create SubCategory || Update SubCategory || Delete SubCategory
- Create Brand || Update Brand || Delete Brand

## Product
- Search ( Title )
- Filter ( Price | Category | SubCategory | Brand )
- Sort ( Date | Price )

## Cart 
- Get Cart
- Add to Cart || Increase
- Remove to Cart || Decrease 

## Order

Platform take %2 fees on every order price nether seller added discount or not fees will be calculated based on original order price but if user used coupon we will bay for it and seller will get ( Product Price -  His Discount ) if he added discount

- Get Orders
- Get Order Details
- Payment [ Cash || Card ]
- Payment Gateway ( Stripe )

## Installation
### Requirements
- Node.js
- MongoDB

### Setup
1. Clone this repository.
2. Install dependencies using `npm install`.
3. Configure environment variables (see `.env.sample` for reference).
4. Start the server with `npm start`.

## License

All rights reserved. This project is solely owned by [Karem Mohamed] and is not licensed for use or distribution by others without explicit permission.

## Credits

This project is the intellectual property of [Karem Mohamed] and should not be credited to or used by any other entity without permission.

## Support or Contact

For any inquiries, support, or feedback regarding this project, feel free to reach out:

- **Email**: karem109k@gmail.com
- **Social Media**: {
    [Facebook](https://www.facebook.com/profile.php?id=100008974722319)
    [LinkedIn](https://www.linkedin.com/in/karem-mohamed-a789a6239/)
}

We welcome your input and suggestions! Please don't hesitate to contact us for assistance or to report any issues.