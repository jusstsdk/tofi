const { registration, login, getUserById, getUserByPhone } = require('../controllers/userController');
const db = require('../db');
const bcrypt = require('bcryptjs');

jest.mock('../db');
jest.mock('bcryptjs');

describe('registration', () => {
    const hashedPassword = 'securePassword';

    beforeEach(() => {
        jest.clearAllMocks();
        bcrypt.hashSync.mockReturnValue(hashedPassword);
    });

    it('should create a new user and return 201 status', async () => {
        const mockUserData = {
            first_name: 'John',
            last_name: 'Doe',
            patronymic: 'Middle',
            email: 'john.doe@example.com',
            password: 'securePassword',
            passport_number: '123456789',
            phone: '+1234567890'
        };

        db.query.mockResolvedValue({ rows: [{ ...mockUserData, password: hashedPassword }] });

        const req = { body: mockUserData };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await registration(req, res);

        expect(db.query).toHaveBeenCalledWith(
            'INSERT INTO users (first_name, last_name, patronymic, email, password, passport_number, phone) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            Object.values(mockUserData)
        );
        expect(bcrypt.hashSync).toHaveBeenCalledWith(mockUserData.password, 10);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ ...mockUserData, password: hashedPassword });
    });

    it('should return 400 status and error message if user with the email already exists', async () => {
        const mockUserData = {
            first_name: 'John',
            last_name: 'Doe',
            patronymic: 'Middle',
            email: 'john.doe@example.com',
            password: 'securePassword',
            passport_number: '123456789',
            phone: '1234567890'
        };

        const errorMessage = 'User with this email already exists';
        const mockError = { code: '23505', constraint: 'users_email_key' };
        db.query.mockRejectedValue(mockError);

        const req = { body: mockUserData };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await registration(req, res);

        expect(db.query).toHaveBeenCalledWith(
            'INSERT INTO users (first_name, last_name, patronymic, email, password, passport_number, phone) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            Object.values(mockUserData)
        );
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });

    it('should return 400 status and default error message for other errors', async () => {
        const errorMessage = 'Registration error';
        const mockError = new Error('Some unexpected error');
        db.query.mockRejectedValue(mockError);

        const req = { body: {} };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await registration(req, res);

        expect(db.query).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: errorMessage });
    });
});

describe('login', () => {
    const mockUserData = {
        user_id: 1,
        first_name: 'John',
        last_name: 'Doe',
        patronymic: 'Middle',
        passport_number: '123456789',
        phone: '1234567890',
        email: 'john.doe@example.com',
        password: 'hashedSecurePassword',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        db.query.mockResolvedValue({ rows: [mockUserData] });
    });

    it('should login successfully and return user data', async () => {
        const req = { body: { email: 'john.doe@example.com', password: 'securePassword' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        bcrypt.compareSync.mockReturnValue(true);

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockUserData);
    });

    it('should return 401 if login credentials are invalid', async () => {
        const req = { body: { email: 'john.doe@example.com', password: 'invalidPassword' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        bcrypt.compareSync.mockReturnValue(false);

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid login or password' });
    });

    it('should return 401 if user with provided email does not exist', async () => {
        const req = { body: { email: 'nonexistent.user@example.com', password: 'somePassword' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        db.query.mockResolvedValue({ rows: [] });

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Invalid login or password' });
    });

    it('should return 400 if an error occurs during login', async () => {
        const req = { body: { email: 'john.doe@example.com', password: 'securePassword' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        db.query.mockRejectedValue(new Error('Database error'));

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Login error' });
    });
});

describe('getUserByPhone', () => {
    const mockUserPhone = '1234567890';
    const mockUserData = { user_id: 1, first_name: 'John', last_name: 'Doe', phone: '1234567890' };

    beforeEach(() => {
        jest.clearAllMocks();
        db.query.mockResolvedValue({ rows: [mockUserData] });
    });

    it('should return user data when the user is found by phone number', async () => {
        const req = { params: { phone: mockUserPhone } };
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };

        await getUserByPhone(req, res);

        expect(res.json).toHaveBeenCalledWith(mockUserData);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 404 if the user is not found by phone number', async () => {
        const req = { params: { phone: 'nonexistentPhoneNumber' } };
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };

        db.query.mockResolvedValue({ rows: [] });

        await getUserByPhone(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
});

describe('getUserById', () => {
    const mockUserId = 1;
    const mockUserData = { first_name: 'John', last_name: 'Doe', phone: '1234567890' };

    beforeEach(() => {
        jest.clearAllMocks();
        db.query.mockResolvedValue({ rows: [mockUserData] });
    });

    it('should return user data when the user is found by user ID', async () => {
        const req = { params: { id: mockUserId } };
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };

        await getUserById(req, res);

        expect(res.json).toHaveBeenCalledWith(mockUserData);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 404 if the user is not found by user ID', async () => {
        const req = { params: { id: 999 } };
        const res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };

        db.query.mockResolvedValue({ rows: [] });

        await getUserById(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
});
