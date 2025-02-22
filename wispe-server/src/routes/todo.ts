import { Op } from '@sequelize/core';
import { Router } from 'express';
import { validateInput } from '../middleware/validateInput';
import { TodoItem, TodoList } from '../models/todo';
import { apiMessage, errorApiMessage } from '../util/apiMessage';
import { validateParams } from '../middleware/validateParams';
import listCreationSchema from '../schemas/todo/create.json';
import listUpdateSchema from '../schemas/todo/update.json';
import itemCreationSchema from '../schemas/todo/item/create.json';
import itemUpdateSchema from '../schemas/todo/item/update.json';

export const router = Router();

router.post('/todo', validateInput(listCreationSchema), async (req, res) => {
    const list = await TodoList.create({
        name: req.body.name
    });

    res.json(apiMessage({
        id: list.id,
        name: list.name
    }));
});

router.get('/todo', async (_, res) => {
    const lists = await TodoList.findAll();

    res.json(apiMessage({
        lists: lists.map(list => ({
            id: list.id,
            name: list.name
        }))
    }));
});

router.get('/todo/:listId', validateParams({ listId: 'number' }), async (req, res) => {
    const listId = parseInt(req.params.listId);

    const list = await TodoList.findByPk(listId);
    if (!list) {
        res.status(404).json(errorApiMessage('No list exists by that id'));
        return;
    }

    const items = await TodoItem.findAll({
        where: { listId }
    });

    res.json(apiMessage({
        id: list.id,
        name: list.name,
        items: items
            .sort((a, b) => a.position - b.position)
            .map(item => ({
                id: item.id,
                name: item.name,
                completed: item.completed,
                completedOn: item.completedOn
            }))
    }));
});

router.post('/todo/:listId', validateParams({ listId: 'number' }), validateInput(listUpdateSchema), async (req, res) => {
    const listId = parseInt(req.params.listId);

    const list = await TodoList.findByPk(listId);
    if (!list) {
        res.status(404).json(errorApiMessage('No list exists by that id'));
        return;
    }

    list.name = req.body.name;
    await list.save();

    const items = await TodoItem.findAll({
        where: { listId }
    });

    res.json(apiMessage({
        id: list.id,
        name: list.name,
        items: items
            .sort((a, b) => a.position - b.position)
            .map(item => ({
                id: item.id,
                name: item.name,
                completed: item.completed,
                completedOn: item.completedOn
            }))
    }));
});

router.delete('/todo/:listId', async (req, res) => {
    const { listId } = req.params;

    const deletionCount = await TodoList.destroy({
        where: {
            id: parseInt(listId)
        }
    });

    if (deletionCount === 0) {
        res.status(404).json(errorApiMessage('No list exists by that id'));
        return;
    }

    res.json(apiMessage({}));
});

router.post('/todo/:listId/items', validateParams({ listId: 'number' }), validateInput(itemCreationSchema), async (req, res) => {
    const listId = parseInt(req.params.listId);
    const list = await TodoList.findByPk(listId);
    if (!list) {
        res.status(404).json(errorApiMessage('No list exists by that id'));
        return;
    }

    const item = await TodoItem.create({
        listId,
        name: req.body.name,
        completed: false,
        position: (await TodoItem.count({ where: { listId } }))
    });

    res.json(apiMessage({
        id: item.id,
        name: item.name,
        completed: item.completed,
        completedOn: item.completedOn,
        position: item.position
    }));
});

router.get('/todo/:listId/items/:itemId', validateParams({ listId: 'number', itemId: 'number' }), async (req, res) => {
    const listId = parseInt(req.params.listId);
    const itemId = parseInt(req.params.itemId);

    const list = await TodoList.findByPk(listId);
    if (!list) {
        res.status(404).json(errorApiMessage('No list exists by that id'));
        return;
    }

    const item = await TodoItem.findByPk(itemId);
    if (!item || item.listId !== listId) {
        res.status(404).json(errorApiMessage('No item exists by that id'));
        return;
    }

    res.json(apiMessage({
        id: item.id,
        name: item.name,
        completed: item.completed,
        completedOn: item.completedOn,
        position: item.position
    }));
});

router.post('/todo/:listId/items/:itemId', validateInput(itemUpdateSchema), async (req, res) => {
    const listId = parseInt(req.params.listId);
    const itemId = parseInt(req.params.itemId);

    const list = await TodoList.findByPk(listId);
    if (!list) {
        res.status(404).json(errorApiMessage('No list exists by that id'));
        return;
    }

    const item = await TodoItem.findByPk(itemId);
    if (!item || item.listId !== listId) {
        res.status(404).json(errorApiMessage('No item exists by that id'));
        return;
    }

    const { name, completed, position } = req.body;
    if (name) {
        item.name = name;
    }

    if (completed !== undefined) {
        item.completed = completed;
    }

    if (position !== undefined && position !== item.position) {
        if (position < 0) {
            res.status(400).json(errorApiMessage('Invalid position'));
            return;
        }
        
        const maxPosition = Math.max((await TodoItem.count({ where: { listId } })) - 1, 0);
        const correctedPosition = Math.min(maxPosition, position);

        if (correctedPosition > item.position) {
            // Moving forward
            await TodoItem.decrement('position', {
                where: {
                    position: {
                        [Op.and]: [
                            { [Op.gt]: item.position },
                            { [Op.lte]: correctedPosition }
                        ]
                    }
                }
            });
        } else {
            // Moving backwards
            await TodoItem.increment('position', {
                where: {
                    position: {
                        [Op.and]: [
                            { [Op.gte]: correctedPosition },
                            { [Op.lt]: item.position }
                        ]
                    }
                }
            });
        }

        item.position = correctedPosition;
    }

    await item.save();

    res.json(apiMessage({
        id: item.id,
        name: item.name,
        completed: item.completed,
        completedOn: item.completedOn,
        position: item.position
    }));
});

router.delete('/todo/:listId/items/:itemId',  async (req, res) => {
    const listId = parseInt(req.params.listId);
    const itemId = parseInt(req.params.itemId);

    const item = await TodoItem.findByPk(itemId);
    if (!item || item.listId !== listId) {
        res.status(404).json(errorApiMessage('No item exists by that id'));
        return;
    }
    
    await item.destroy();

    await TodoItem.decrement('position', {
        where: {
            listId,
            position: {
                [Op.gt]: item.position
            }
        }
    });

    res.json(apiMessage({}));
});