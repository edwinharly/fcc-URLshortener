require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

const User = require('../models/user').Model;
const secret = process.env.SECRET

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/', (req, res) => {
    const token = req.headers['x-access-token'];
    if (!token)
        return res.status(401).json({ auth: false, message: 'No token provided' });

    jwt.verify(token, secret, (err, decoded) => {
        if (err)
            return res.status(500).json({ auth: false, message: 'Failed to authenticate token'} );

        const { username } = decoded;
    })
})

router.post('/', (req, res) => {
    const {
        username,
        password,
    } = req.body;

    User.findOne({ username }, (err, user) => {
        if (err)
            return res.status(500).send(err);

        if (!user) {
            const hashedPass = bcrypt.hashSync(password, 8);

            const newUser = new User({
                username,
                password: hashedPass,
            });

            newUser.save((err, newUser) => {
                if (err) {
                    console.error(err);
                    res.status(500).json(err);
                } else {
                    const token = jwt.sign({ username }, secret, {
                        expiresIn: 86400,
                    });

                    res.status(201).json({
                        message: `${newUser.username} created`,
                        token,
                    });
                }
            })
        } else {
            res.status(403).send('User already exist');
        }
    })
});

router.post('/token', (req, res) => {
    const {
        username,
        password,
    } = req.body;

    User.findOne({ username }, (err, user) => {
        if (err) {
            console.error(err);
            res.status(500).json(err);
        }

        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!user) {
            return res.status(404).send('No user found');
        }

        if (!passwordIsValid)
            return res.status(401).json({ auth: false, token: null });

        const token = jwt.sign({ username }, secret, {
            expiresIn: 86400,
        });

        res.status(200).json({ auth: true, token });
    })
});

module.exports = router;