import 'mocha';
import { request } from "chai-http";
import { expect } from 'chai';
import app from '../../src/app';
import { createRandomUser } from '../utils';
import { TodoItem, TodoList } from '../../src/models/todo';

let ourUser: { username: string, password: string, jwt: string };

describe('Todo Tests', () => {
    beforeEach(async () => {
        ourUser = await createRandomUser({ isAdmin: false });
    });

    it('should retrieve all of the lists', async () => {
        await TodoList.bulkCreate([
            { name: 'a' },
            { name: 'b' }
        ]);
        
        const response = await request.execute(app)
            .get('/api/todo')
            .set('Authorization', `Bearer ${ourUser.jwt}`);
        
        expect(response.body.data.lists.length).to.equal(2);
        expect(response.body.data.lists[0].name).to.equal('a');
        expect(response.body.data.lists[1].name).to.equal('b');
    });

    it('should be able to create a new list', async () => {
        const response = await request.execute(app)
            .post('/api/todo')
            .set('Authorization', `Bearer ${ourUser.jwt}`)
            .send({ name: 'New List' });

        expect(response.body.status).to.equal('OK');

        const listCount = await TodoList.count();
        expect(listCount).to.equal(1);
    });

    it('should be able to retrieve a specific list and its items', async () => {
        const list = await TodoList.create({ name: 'New List' });
        await TodoItem.bulkCreate([
            { listId: list.id, name: 'Meow', completed: false, position: 0 }
        ]);

        const response = await request.execute(app)
            .get(`/api/todo/${list.id}`)
            .set('Authorization', `Bearer ${ourUser.jwt}`);

        expect(response.body.status).to.equal('OK');
        expect(response.body.data.name).to.equal('New List');
        expect(response.body.data.items.length).to.equal(1);
    });

    it('should throw an error if we retrieve a list that does not exist', async () => {
        const response = await request.execute(app)
            .get('/api/todo/999')
            .set('Authorization', `Bearer ${ourUser.jwt}`);

        expect(response.statusCode).to.equal(404);
        expect(response.body.status).to.equal('ERROR');
    });

    it('should be able to delete a list with items', async () => {
        const list = await TodoList.create({ name: 'New List' });
        await TodoItem.bulkCreate([
            { listId: list.id, name: 'Meow', completed: false, position: 0 }
        ]);

        const response = await request.execute(app)
            .delete(`/api/todo/${list.id}`)
            .set('Authorization', `Bearer ${ourUser.jwt}`);

        expect(response.body.status).to.equal('OK');

        const listCount = await TodoList.count();
        expect(listCount).to.equal(0);
    });
    
    it('should throw an error if we try to delete a list that does not exist', async () => {
        const response = await request.execute(app)
            .delete('/api/todo/999')
            .set('Authorization', `Bearer ${ourUser.jwt}`);

        expect(response.statusCode).to.equal(404);
        expect(response.body.status).to.equal('ERROR');
    });

    it('should be able to update a list', async () => {
        const list = await TodoList.create({ name: 'New List' });
        await TodoItem.create({ listId: list.id, name: 'Item', completed: false, position: 0 });

        const response = await request.execute(app)
            .post(`/api/todo/${list.id}`)
            .set('Authorization', `Bearer ${ourUser.jwt}`)
            .send({ name: 'Updated Name' });

        expect(response.body.status).to.equal('OK');

        // Ensure it did not change the items
        expect(response.body.data.items.length).to.equal(1);
        
        await list.reload();
        expect(list.name).to.equal('Updated Name');
    });

    it('should throw an error if we update a list that does not exist', async () => {
       const response = await request.execute(app)
            .post('/api/todo/999')
            .set('Authorization', `Bearer ${ourUser.jwt}`)
            .send({ name: 'Updated Name' });

        expect(response.statusCode).to.equal(404);
        expect(response.body.status).to.equal('ERROR'); 
    });

    it('should be able to add an item to a specific list with items already', async () => {
        const list = await TodoList.create({ name: 'New List' });
        await TodoItem.create({ name: 'Item', listId: list.id, completed: false, position: 0 });

        const response = await request.execute(app)
            .post(`/api/todo/${list.id}/items`)
            .set('Authorization', `Bearer ${ourUser.jwt}`)
            .send({
                name: 'Item'
            });

        expect(response.body.status).to.equal('OK');

        const itemCount = await TodoItem.count();
        expect(itemCount).to.equal(2);
    });

    it('should throw an error if we try to add an item to a list that does not exist', async () => {
        const response = await request.execute(app)
            .post('/api/todo/999/items')
            .set('Authorization', `Bearer ${ourUser.jwt}`)
            .send({
                name: 'Item'
            });

        expect(response.statusCode).to.equal(404);
        expect(response.body.status).to.equal('ERROR');
    });

    it('should be able to retrieve a specific list item', async () => {
        const list = await TodoList.create({ name: 'New List' });
        const item = await TodoItem.create({ listId: list.id, name: 'Meow', completed: false, position: 0 });

        const response = await request.execute(app)
            .get(`/api/todo/${list.id}/items/${item.id}`)
            .set('Authorization', `Bearer ${ourUser.jwt}`);

        expect(response.body.status).to.equal('OK');
        expect(response.body.data.name).to.equal('Meow');
        expect(response.body.data.id).to.equal(item.id);
    });

    it('should throw an error if we try to retrieve a specific list item but the list does not exist', async () => {
        const list = await TodoList.create({ name: 'New List' });
        const item = await TodoItem.create({ listId: list.id, name: 'Meow', completed: false, position: 0 });

        const response = await request.execute(app)
            .get(`/api/todo/${list.id + 1}/items/${item.id}`)
            .set('Authorization', `Bearer ${ourUser.jwt}`);

        expect(response.statusCode).to.equal(404);
        expect(response.body.status).to.equal('ERROR');
    });

    it('should throw an error if we try to retrieve a specific list item but the item does not exist', async () => {
        const list = await TodoList.create({ name: 'New List' });
        const item = await TodoItem.create({ listId: list.id, name: 'Meow', completed: false, position: 0 });

        const response = await request.execute(app)
            .get(`/api/todo/${list.id}/items/${item.id + 1}`)
            .set('Authorization', `Bearer ${ourUser.jwt}`);

        expect(response.statusCode).to.equal(404);
        expect(response.body.status).to.equal('ERROR');
    });

    it('should be able to update a specific list item', async () => {
        const list = await TodoList.create({ name: 'New List' });
        const item = await TodoItem.create({ listId: list.id, name: 'Meow', completed: false, position: 0 });

        const response = await request.execute(app)
            .post(`/api/todo/${list.id}/items/${item.id}`)
            .set('Authorization', `Bearer ${ourUser.jwt}`)
            .send({ name: 'New Name', completed: true });

        expect(response.body.status).to.equal('OK');
        
        await item.reload();
        expect(item.name).to.equal('New Name');
        expect(item.completed).to.equal(true);
    });

    it('should throw an error if we try to update a specific list item but the list does not exist', async () => {
        const list = await TodoList.create({ name: 'New List' });
        const item = await TodoItem.create({ listId: list.id, name: 'Meow', completed: false, position: 0 });

        const response = await request.execute(app)
            .post(`/api/todo/${list.id + 1}/items/${item.id}`)
            .set('Authorization', `Bearer ${ourUser.jwt}`)
            .send({ name: 'New Name', completed: true });

        expect(response.statusCode).to.equal(404);
        expect(response.body.status).to.equal('ERROR');
    });

    it('should throw an error if we try to update a specific list item but the item does not exist', async () => {
        const list = await TodoList.create({ name: 'New List' });
        const item = await TodoItem.create({ listId: list.id, name: 'Meow', completed: false, position: 0 });

        const response = await request.execute(app)
            .post(`/api/todo/${list.id}/items/${item.id + 1}`)
            .set('Authorization', `Bearer ${ourUser.jwt}`)
            .send({ name: 'New Name', completed: true });

        expect(response.statusCode).to.equal(404);
        expect(response.body.status).to.equal('ERROR');
    });

    it('should be able to delete a specific list item', async () => {
        const list = await TodoList.create({ name: 'New List' });
        const item = await TodoItem.create({ listId: list.id, name: 'Meow', completed: false, position: 0 });

        const response = await request.execute(app)
            .delete(`/api/todo/${list.id}/items/${item.id}`)
            .set('Authorization', `Bearer ${ourUser.jwt}`);

        expect(response.body.status).to.equal('OK');

        const itemCount = await TodoItem.count();
        expect(itemCount).to.equal(0);
    });

    it('should throw an error if we try to delete a item that does not exist', async () => {
        const response = await request.execute(app)
            .delete('/api/todo/999/items/999')
            .set('Authorization', `Bearer ${ourUser.jwt}`);

        expect(response.statusCode).to.equal(404);
        expect(response.body.status).to.equal('ERROR');
    });

    it('should be able to reorder list items before other items', async () => {
        const list = await TodoList.create({ name: 'New List' });
        const items = await TodoItem.bulkCreate([
            { listId: list.id, name: 'A', completed: false, position: 0 },
            { listId: list.id, name: 'B', completed: false, position: 1 },
            { listId: list.id, name: 'C', completed: false, position: 2 },
            { listId: list.id, name: 'D', completed: false, position: 3 },
            { listId: list.id, name: 'E', completed: false, position: 4 }
        ]);

        await request.execute(app)
            .post(`/api/todo/${list.id}/items/${items[2].id}`)
            .set('Authorization', `Bearer ${ourUser.jwt}`)
            .send({ position: 0 });

        await Promise.all(items.map(i => i.reload()));

        expect(items[2].position).to.equal(0);
        expect(items[0].position).to.equal(1);
        expect(items[1].position).to.equal(2);
        expect(items[3].position).to.equal(3);
        expect(items[4].position).to.equal(4);
    });

    it('should be able to reorder list items after other items', async () => {
        const list = await TodoList.create({ name: 'New List' });
        const items = await TodoItem.bulkCreate([
            { listId: list.id, name: 'A', completed: false, position: 0 },
            { listId: list.id, name: 'B', completed: false, position: 1 },
            { listId: list.id, name: 'C', completed: false, position: 2 },
            { listId: list.id, name: 'D', completed: false, position: 3 },
            { listId: list.id, name: 'E', completed: false, position: 4 }
        ]);

        await request.execute(app)
            .post(`/api/todo/${list.id}/items/${items[0].id}`)
            .set('Authorization', `Bearer ${ourUser.jwt}`)
            .send({ position: 3 });

        await Promise.all(items.map(i => i.reload()));

        expect(items[0].position).to.equal(3);
        expect(items[1].position).to.equal(0);
        expect(items[2].position).to.equal(1);
        expect(items[3].position).to.equal(2);
        expect(items[4].position).to.equal(4);
    });

    it('should throw an error if given an invalid position to reorder to', async () => {
        const list = await TodoList.create({ name: 'New List' });
        const items = await TodoItem.bulkCreate([
            { listId: list.id, name: 'A', completed: false, position: 0 },
            { listId: list.id, name: 'B', completed: false, position: 1 },
            { listId: list.id, name: 'C', completed: false, position: 2 }
        ]);

        const response = await request.execute(app)
            .post(`/api/todo/${list.id}/items/${items[0].id}`)
            .set('Authorization', `Bearer ${ourUser.jwt}`)
            .send({ position: -1 });
        
        expect(response.body.status).to.equal('ERROR')
    });

});