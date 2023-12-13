const {createCollecting, getAllUserCollectings, getOneCollecting} = require('../controllers/collectingController');
const db = require('../db');

jest.mock('../db');

describe('createCollecting', () => {
    const mockRequest = (body, params) => ({body, params});
    const mockResponse = () => {
        const res = {};
        res.json = jest.fn().mockReturnValue(res);
        res.status = jest.fn().mockReturnValue(res);
        return res;
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new collecting and return success', async () => {
        const mockCollectingData = {
            name: 'Test Collecting',
            sum: 100,
            expiration_date: '2023-12-31',
            account: 'test_account',
            author_id: 1,
            members: [{user_id: 2}, {user_id: 3}]
        };

        db.query.mockResolvedValueOnce({
            rows: [{collecting_id: 1}]
        });

        const req = mockRequest(mockCollectingData);
        const res = mockResponse();

        await createCollecting(req, res);

        expect(db.query).toHaveBeenCalledTimes(3);
        expect(res.json).toHaveBeenCalledWith({success: true});
    });

    it('should handle errors and return 500 status on database error', async () => {
        const errorMessage = 'Database error';
        db.query.mockRejectedValueOnce(new Error(errorMessage));

        const req = mockRequest({});
        const res = mockResponse();

        await createCollecting(req, res);

        expect(db.query).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({error: 'Internal Server Error'});
    });
});

describe('getAllUserCollectings', () => {
    const mockRequest = (params) => ({ params });
    const mockResponse = () => {
        const res = {};
        res.json = jest.fn().mockReturnValue(res);
        res.status = jest.fn().mockReturnValue(res);
        return res;
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return user collectings with status 200', async () => {
        const mockUserId = 1;

        db.query.mockResolvedValueOnce({
            rows: [
                { collecting_id: 1, name: 'Test Collecting 1', sum: 100, expiration_date: '2023-12-31', members_count: 3 },
                { collecting_id: 2, name: 'Test Collecting 2', sum: 50, expiration_date: '2023-11-30', members_count: 2 }
            ]
        });

        const req = mockRequest({ user_id: mockUserId });
        const res = mockResponse();

        await getAllUserCollectings(req, res);

        expect(db.query).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith([
            { collecting_id: 1, name: 'Test Collecting 1', sum: 100, expiration_date: '2023-12-31', members_count: 3 },
            { collecting_id: 2, name: 'Test Collecting 2', sum: 50, expiration_date: '2023-11-30', members_count: 2 }
        ]);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle errors and return 500 status on database error', async () => {
        const errorMessage = 'Database error';
        db.query.mockRejectedValueOnce(new Error(errorMessage));

        const req = mockRequest({ user_id: 1 });
        const res = mockResponse();

        await getAllUserCollectings(req, res);

        expect(db.query).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
});

describe('getOneCollecting', () => {
    const mockRequest = (params) => ({ params });
    const mockResponse = () => {
        const res = {};
        res.json = jest.fn().mockReturnValue(res);
        res.status = jest.fn().mockReturnValue(res);
        return res;
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return collecting information with status 200', async () => {
        const mockCollectingId = 1;

        db.query.mockResolvedValueOnce({
            rows: [
                { name: 'Test Collecting', sum: 100, expiration_date: '2023-12-31', account: 'test_account', author_id: 1 }
            ]
        });

        db.query.mockResolvedValueOnce({
            rows: [
                { user_id: 2 },
                { user_id: 3 }
            ]
        });

        const req = mockRequest({ id: mockCollectingId });
        const res = mockResponse();

        await getOneCollecting(req, res);

        expect(db.query).toHaveBeenCalledTimes(2);
        expect(res.json).toHaveBeenCalledWith({
            collecting: [
                { name: 'Test Collecting', sum: 100, expiration_date: '2023-12-31', account: 'test_account', author_id: 1 }
            ],
            users: [
                { user_id: 2 },
                { user_id: 3 }
            ]
        });
        expect(res.status).not.toHaveBeenCalled(); // Убедитесь, что вызов res.status не был произведен
    });

    it('should handle errors and return 500 status on database error', async () => {
        const errorMessage = 'Database error';
        db.query.mockRejectedValueOnce(new Error(errorMessage));

        const req = mockRequest({ id: 1 });
        const res = mockResponse();

        await getOneCollecting(req, res);

        expect(db.query).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
});
