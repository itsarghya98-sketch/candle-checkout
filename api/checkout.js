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

    const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { amount, cart } = req.body;

    const order = await razorpay.orders.create({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: "receipt_" + Date.now(),
        notes: {
            cart_items: JSON.stringify(cart)
        }
    });

    const paymentLink = await razorpay.paymentLink.create({
        amount: Math.round(amount * 100),
        currency: "INR",
        description: "Candle Order",
        callback_url: "https://arghyascandle.framer.media/thank-you",
        callback_method: "get",
        notes: {
            cart_items: JSON.stringify(cart)
        }
    });

    res.status(200).json({ url: paymentLink.short_url });
};
