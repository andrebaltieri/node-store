'use strict';
const md5 = require('md5');
const guid = require('guid');
const azure = require('azure-storage');
const config = require('../config');
const repository = require('../repositories/customer-repository');
const emailService = require('../services/email-service');
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

exports.getByDocument = async(req, res) => {
    try {
        var result = await repository.getByDocument(req.params.document);
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

        // Verifica se o CPF já está em uso
        var docsCount = await repository.countDocuments(req.body.document);
        if (docsCount > 0) {
            res.status(400).send({
                message: 'Este CPF já está em uso'
            }).end();
            return;
        }

        // Verifica se o E-mail já está em uso
        var emailsCount = await repository.countEmails(req.body.email);
        if (emailsCount > 0) {
            res.status(400).send({
                message: 'Este E-mail já está em uso'
            }).end();
            return;
        }

        // Persiste o aluno
        const result = await repository.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            document: req.body.document,
            email: req.body.email,
            password: md5(req.body.password + global.SALT_KEY),
            active: false,
            roles: ['customer']
        });

        // Gera uma chave de ativação
        var activationKey = md5(req.body.document + req.body.email + global.SALT_KEY);

        // Envia o E-mail de ativação de conta
        emailService.send(
            req.body.email,
            'balta.io | Ative seu cadastro',
            global.ACTV_ACC_EMAIL
            .replace('{0}', result.firstName + ' ' + result.lastName)
            .replace('{1}', activationKey));

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