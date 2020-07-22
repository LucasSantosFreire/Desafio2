const User = require("../models/User");
const Yup = require("yup");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();
module.exports = {
    async login(req, res) {
        const user = await User.findOne({
            where: { email: req.body.email },
        });
        if (user === null) {
            res.status(500).json({ message: "Usuário não existe" });
        } else {
            const { id, name, email, password_hash } = user;
            if (bcrypt.compareSync(req.body.password, password_hash)) {
                var token = jwt.sign({ id }, process.env.SECRET);
                return res.json({ id, name, email, token: token });
            } else {
                res.status(500).json({ message: "Login inválido!" });
            }
        }
    },
    ///////////////////////////////////////////////////////////////////////
    async logout(req, res) {
        res.status(200).send({
            message: "Fez logout e cancelou o token!",
            auth: false,
            token: null,
        });
    },
    ///////////////////////////////////////////////////////////////////////
    async store(req, res) {
        const schema = Yup.object().shape({
            admin: Yup.bool().required(),
            name: Yup.string().required(),
            email: Yup.string().email().required(),
            password: Yup.string().required().min(6).max(20),
            confirmPassword: Yup.string().when("password", (password, field) =>
                password ? field.required().oneOf([Yup.ref("password")]) : field
            ),
        });
        const user = await User.findOne({
            where: { id: req.user.id },
        });
        if (user.admin === false) {
            return res.status(403).json({ error: "Não autorizado" });
        }

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: "Falha na validação" });
        }
        const userExists = await User.findOne({
            where: { email: req.body.email },
        });
        if (userExists) {
            return res.status(400).json({ error: "Usuario ja existe" });
        }

        const { id, name, email, password, admin } = await User.create({
            name: req.body.name,
            admin: req.body.admin,
            email: req.body.email,
            password_hash: bcrypt.hashSync(req.body.password, 8),
        });
        return res.json({ id, admin, name, email });
    },
    ///////////////////////////////////////////////////////////////////////
    async index(req, res) {
        const user = await User.findOne({
            where: { id: req.user.id },
        });
        if (user.admin === false) {
            return res.status(403).json({ error: "Não autorizado" });
        }
        const users = await User.findAll({
            attributes: {
                exclude: ["password_hash", "createdAt", "updatedAt"],
            },
            limit: 20,
            order: ["id"],
        });
        if (users.length === 0) {
            return res
                .status(404)
                .json({ error: "Não existem usuarios cadastrados" });
        }
        return res.json(users);
    },

    ///////////////////////////////////////////////////////////////////////

    async personalIndex(req, res) {
        const users = await User.findByPk(req.user.id, {
            attributes: ["id", "admin", "name", "email"],
        });
        return res.json(users);
    },

    ///////////////////////////////////////////////////////////////////////
    async personalChange(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email(),
            oldPassword: Yup.string().min(6).max(20),
            password: Yup.string().when("oldPassword", (oldPassword, field) =>
                oldPassword ? field.required() : field
            ),
            confirmPassword: Yup.string().when("password", (password, field) =>
                password ? field.required().oneOf([Yup.ref("password")]) : field
            ),
        });
        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: "Falha na validação" });
        }

        const id = req.user.id;
        const {
            name,
            email,
            oldPassword,
            password,
            confirmPassword,
        } = req.body;
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(400).json({ error: "Usuário não existe." });
        }
        if (user.email !== email) {
            const userExists = await User.findOne({
                where: { email },
            });
            if (userExists) {
                return res.status(400).json({ error: "Usuário ja existe." });
            }
        }
        if (oldPassword == null) {
            const user = await User.update(
                {
                    name,
                    email,
                },
                {
                    where: {
                        id,
                    },
                }
            );
            return res.json({ msg: "Informações alteradas com sucesso!" });
        } else {
            if (
                oldPassword !== null &&
                bcrypt.compareSync(oldPassword, user.password_hash)
            ) {
                const password_hash = bcrypt.hashSync(password, 8);
                const user = await User.update(
                    {
                        name,
                        email,
                        password_hash,
                    },
                    {
                        where: {
                            id,
                        },
                    }
                );
                return res.json({ msg: "Informações alteradas com sucesso!" });
            }
        }
    },
    ///////////////////////////////////////////////////////////////////////
    async personalDelete(req, res) {
        const id = req.user.id;
        const checkUser = await User.findByPk(id);

        if (checkUser) {
            const user = await User.destroy({
                where: {
                    id,
                },
            });
            return res.json({ msg: "Apagado com sucesso!" });
        } else {
            return res.status(404).json({ error: "Usuário não existe" });
        }
    },
};
