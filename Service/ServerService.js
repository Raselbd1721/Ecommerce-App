
const rateLimit= require('express-rate-limit')

const limiter = rateLimit({
	windowMs: 1 * 60 * 1000,
	limit: 100, 
	message:"Too much try",
	standardHeaders: 'draft-7',
	legacyHeaders: false,
})

module.exports={limiter}