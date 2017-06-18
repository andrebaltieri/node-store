'use strict';
const azure = require('azure-storage');
const config = require('../config');
const repository = require('../repositories/product-repository');
const ValidationContract = require('../validations/fluent-validator');

exports.get = async(req, res) => {
    try {
        var result = await repository.get();
        res.status(200).send(result);
    } catch (e) {
        res.status(500).send({
            message: 'Falha ao processar sua requisição'
        });
    }
}

exports.create = async(req, res) => {
    try {
        // Validações
        let contract = new ValidationContract();
        contract.hasMinLen(req.body.firstName, 3, 'O nome deve conter pelo menos 3 caracteres');
        contract.hasMaxLen(req.body.firstName, 40, 'O nome deve conter no máximo 40 caracteres');
        contract.hasMinLen(req.body.lastName, 3, 'O sobrenome deve conter pelo menos 3 caracteres');
        contract.hasMaxLen(req.body.lastName, 40, 'O sobrenome deve conter no máximo 40 caracteres');
        contract.isRequired(req.body.document, 'O CPF é obrigatório');
        contract.isFixedLen(req.body.document, 11, 'O CPF deve conter 11 caracteres');
        contract.isEmail(req.body.email, 'E-mail inválido');
        contract.hasMinLen(req.body.password, 6, 'A senha deve conter pelo menos 6 caracteres');
        contract.hasMaxLen(req.body.password, 20, 'A senha deve conter no máximo 20 caracteres');

        // Se os dados forem inválidos
        if (!contract.isValid()) {
            res.status(400).send(contract.errors()).end();
            return;
        }
        
        // Retorna sucesso
        res.status(201).send({
            message: 'Sua conta foi criada e está pendente ativação'
        });
    } catch (e) {
        console.log(e);
        res.status(500).send({
            message: 'Falha ao processar sua requisição'
        });
    }
}