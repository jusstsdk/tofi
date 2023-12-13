const { createAccount, getAllAccounts, getOneAccount } = require('../controllers/accountController');
const db = require('../db');
const uuid = require('uuid');

jest.mock('../db');
jest.mock('uuid');

describe('createAccount', () => {
    const mockAccountId = 'mockAccountId';
    const mockUserId = 1;
    const mockTypeId = 2;
    const mockNewAccountData = { account_id: mockAccountId, user_id: mockUserId, expiration_date: '2023-12-31', type_id: mockTypeId };

    beforeEach(() => {
        jest.clearAllMocks();
        uuid.v4.mockReturnValue(mockAccountId);
        db.query.mockResolvedValue({ rows: [mockNewAccountData] });
    });

    it('should create a new account and return the account data', async () => {
        const req = { body: { user_id: mockUserId, type_id: mockTypeId } };
        const res = {
            json: jest.fn(),
        };

        await createAccount(req, res);

        expect(uuid.v4).toHaveBeenCalled();
        expect(db.query).toHaveBeenCalledWith(
            'INSERT INTO accounts (account_id, user_id, expiration_date, type_id) VALUES ($1, $2, now(), $3) RETURNING *',
            [mockAccountId, mockUserId, mockTypeId]
        );
        expect(res.json).toHaveBeenCalledWith([mockNewAccountData]);
    });

    it('should handle errors and return 500 status on database error', async () => {
        const errorMessage = 'Database error';
        db.query.mockRejectedValue(new Error(errorMessage));

        const req = { body: { user_id: mockUserId, type_id: mockTypeId } };
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };

        await createAccount(req, res);

        expect(uuid.v4).toHaveBeenCalled();
        expect(db.query).toHaveBeenCalledWith(
            'INSERT INTO accounts (account_id, user_id, expiration_date, type_id) VALUES ($1, $2, now(), $3) RETURNING *',
            [mockAccountId, mockUserId, mockTypeId]
        );
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
});

describe('getAllAccounts', () => {
    const mockUserId = 1;
    const mockAccountsData = [
        { account_id: 'id1', user_id: mockUserId, expiration_date: '2023-12-31', type_id: 1 },
        { account_id: 'id2', user_id: mockUserId, expiration_date: '2023-12-31', type_id: 2 },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        db.query.mockResolvedValue({ rows: mockAccountsData });
    });

    it('should return accounts data for the given user ID', async () => {
        const req = { params: { userid: mockUserId } };
        const res = {
            json: jest.fn(),
        };

        await getAllAccounts(req, res);

        expect(db.query).toHaveBeenCalledWith('SELECT * FROM accounts WHERE user_id = $1', [mockUserId]);
        expect(res.json).toHaveBeenCalledWith(mockAccountsData);
    });

    it('should handle errors and return 500 status on database error', async () => {
        const errorMessage = 'Database error';
        db.query.mockRejectedValue(new Error(errorMessage));

        const req = { params: { userid: mockUserId } };
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };

        await getAllAccounts(req, res);

        expect(db.query).toHaveBeenCalledWith('SELECT * FROM accounts WHERE user_id = $1', [mockUserId]);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
});

describe('getOneAccount', () => {
    it('should return account data when the account exists', async () => {
        const mockAccountData = { user_id: 27, balance: 100 };
        db.query.mockResolvedValue({ rows: [mockAccountData] });

        const req = { params: { id: 'yourAccountId' } };
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };

        await getOneAccount(req, res);

        expect(res.json).toHaveBeenCalledWith(mockAccountData);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 404 if the account does not exist', async () => {
        db.query.mockResolvedValue({ rows: [] });

        const req = { params: { id: 'nonExistentId' } };
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };

        await getOneAccount(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'Account not found' });
    });

    it('should return 500 if there is an error', async () => {
        const errorMessage = 'Database error';
        db.query.mockRejectedValue(new Error(errorMessage));

        const req = { params: { id: 'someId' } };
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };

        await getOneAccount(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
});
