const User = require("../models/User");
const Recipient = require("../models/Recipient");
const Yup = require("yup");
const { personalChange } = require("./UserController");
const { request } = require("express");

module.exports = {
    async store(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            address: Yup.string().required(),
            number: Yup.number().integer().positive().required(),
            complement: Yup.string(),
            state: Yup.string().required(),
            city: Yup.string().required(),
            cep: Yup.number().integer().positive().required(),
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
        const recipientExists = await Recipient.findOne({
            where: {
                name: req.body.name,
                address: req.body.address,
                number: req.body.number,
                state: req.body.state,
                city: req.body.city,
                cep: req.body.cep,
                complement: req.body.complement,
            },
        });
        if (recipientExists) {
            return res.status(400).json({ error: "Usuario ja existe" });
        }

        const {
            id,
            name,
            address,
            number,
            complement,
            state,
            city,
            cep,
        } = await Recipient.create(req.body);
        return res.json({
            id,
            name,
            address,
            number,
            complement,
            state,
            city,
            cep,
        });
    },

    ///////////////////////////////////////////////////////////////

    async index(req, res) {
        const recipients = await Recipient.findAll({
            attributes: {
                exclude: ["createdAt", "updatedAt"],
            },
            limit: 20,
            order: ["id"],
        });
        if (recipients.length === 0) {
            return res
                .status(404)
                .json({ error: "Não existem usuarios cadastrados" });
        }
        return res.json(recipients);
    },

    ///////////////////////////////////////////////////////////////
    async personalIndex(req, res) {
        const recipient = await Recipient.findByPk(req.params.id, {
            attributes: {
                exclude: ["createdAt", "updatedAt"],
            },
        });
        if (recipient === null) {
            return res.status(404).json({ error: "Usuário não existe!" });
        }
        return res.json(recipient);
    },
    ///////////////////////////////////////////////////////////////
    async personalChange(req, res) {
        const schema = Yup.object().shape({
            name: Yup.string(),
            address: Yup.string(),
            number: Yup.number().integer().positive(),
            complement: Yup.string(),
            state: Yup.string(),
            city: Yup.string(),
            cep: Yup.number().integer().positive(),
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
        if (
            req.body.name !== undefined &&
            req.body.address !== undefined &&
            req.body.number !== undefined &&
            req.body.complement !== undefined &&
            req.body.state !== undefined &&
            req.body.city !== undefined &&
            req.body.cep !== undefined
        ) {
            const recipientExists = await Recipient.findOne({
                where: {
                    name: req.body.name,
                    address: req.body.address,
                    number: req.body.number,
                    complement: req.body.complement,
                    state: req.body.state,
                    city: req.body.city,
                    cep: req.body.cep,
                },
            });
            if (recipientExists) {
                return res.status(400).json({ error: "Usuario ja existe" });
            }
        }

        const id = req.params.id;
        const {
            name,
            address,
            number,
            state,
            city,
            cep,
            complement,
        } = req.body;
        const recipient = await Recipient.update(
            {
                name,
                address,
                number,
                state,
                city,
                cep,
                complement,
            },
            {
                where: {
                    id,
                },
            }
        );
        return res.json({ msg: "Informações alteradas com sucesso!" });
    },

    ///////////////////////////////////////////////////////////////
    async personalDelete(req, res) {
        const user = await User.findOne({
            where: { id: req.user.id },
        });
        if (user.admin === false) {
            return res.status(403).json({ error: "Não autorizado" });
        }
        const id = req.params.id;
        const checkRecipient = await Recipient.findByPk(id);

        if (checkRecipient) {
            const recipient = await Recipient.destroy({
                where: {
                    id,
                },
            });
            return res.json({ msg: "Apagado com sucesso!" });
        } else {
            return res.status(404).json({ error: "Usuário não existe" });
        }
    },
    ///////////////////////////////////////////////////////////////
};
