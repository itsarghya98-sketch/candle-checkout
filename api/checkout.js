const Razorpay = require("razorpay");

module.exports = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const { amount, cart, shipping } = req.body;

        const paymentLink = await razorpay.paymentLink.create({
            amount: Math.round(amount * 100),
            currency: "INR",
            description: "Candle Order",
            customer: {
                name: shipping ? `${shipping.firstName} ${shipping.lastName}` : "",
                email: shipping ? shipping.email : "",
                contact: shipping ? shipping.phone : "",
            },
            notify: {
                sms: true,
                email: true,
            },
            callback_url: "https://arghyascandle.framer.media/thank-you-page",
            callback_method: "get",
            notes: {
                cart_items: JSON.stringify(cart),
                address: shipping ? `${shipping.address}, ${shipping.city}, ${shipping.state} - ${shipping.pincode}` : "",
            }
        });

        res.status(200).json({ url: paymentLink.short_url });

    } catch (err) {
        console.error(err)
        res.status(500).json({ error: err.message });
    }
};
