const mongoose = require('mongoose');
const Product = require("../models/Products");

const validateProduct = (req, res, next) => {
	const { name, price, category, stock } = req.body || {};
	const errors = [];

	if (typeof name !== "string" || !name.trim()) errors.push("Product name is required");
	if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
		errors.push("Price must be a non-negative number");
	}
	if (typeof category !== "string" || !category.trim()) errors.push("Category is required");
	if (typeof stock !== "number" || !Number.isFinite(stock) || stock < 0) {
		errors.push("Stock must be a non-negative number");
	}

	if (errors.length) return res.status(400).json({ message: "Invalid product data", errors });
	next();
};

const listProducts = async (req, res, next) => {
	try {
		const products = await Product.find().sort({ _id: -1 });
		res.json(products);
	} catch (error) {
		next(error);
	}
};

const getProduct = async (req, res, next) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) {
			return res.status(400).json({ message: "Invalid product id" });
		}
		const product = await Product.findById(req.params.id);
		if (!product) return res.status(404).json({ message: "Product not found" });
		res.json(product);
	} catch (error) {
		next(error);
	}
};

const createProduct = async (req, res, next) => {
	try {
		const product = await Product.create(req.body);
		res.status(201).json(product);
	} catch (error) {
		next(error);
	}
};

const updateProduct = async (req, res, next) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) {
			return res.status(400).json({ message: "Invalid product id" });
		}
		const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
			overwrite: true
		});
		if (!product) return res.status(404).json({ message: "Product not found" });
		res.json(product);
	} catch (error) {
		next(error);
	}
};

const deleteProduct = async (req, res, next) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) {
			return res.status(400).json({ message: "Invalid product id" });
		}
		const product = await Product.findByIdAndDelete(req.params.id);
		if (!product) return res.status(404).json({ message: "Product not found" });
		res.json({ message: "Product deleted" });
	} catch (error) {
		next(error);
	}
};

module.exports = { validateProduct, listProducts, getProduct, createProduct, updateProduct, deleteProduct };
