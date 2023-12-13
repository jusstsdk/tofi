const {createPayment, getAllUserPayments} = require('../controllers/PaymentController');
const db = require('../db');

jest.mock('../db');

describe('createPayment', () => {
    const mockRequest = (body) => ({body});
    const mockResponse = () => {
        const res = {};
        res.json = jest.fn().mockReturnValue(res);
        res.status = jest.fn().mockReturnValue(res);
        return res;
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a new payment and return payment details', async () => {
        const mockPaymentData = {
            sender_account_id: 'senderAccountId',
            receiver_account_id: 'receiverAccountId',
            transfer_amount: 100
        };

        db.query.mockResolvedValueOnce({
            rows: [{transaction_id: 1, transaction_date: '2023-12-31', transfer_amount: 100}]
        });

        const req = mockRequest(mockPaymentData);
        const res = mockResponse();

        await createPayment(req, res);

        expect(db.query).toHaveBeenCalledTimes(3);
        expect(res.json).toHaveBeenCalledWith([{
            transaction_id: 1,
            transaction_date: '2023-12-31',
            transfer_amount: 100
        }]);
    });

    it('should handle errors and return 500 status on database error', async () => {
        const errorMessage = 'Database error';
        db.query.mockRejectedValueOnce(new Error(errorMessage));

        const req = mockRequest({});
        const res = mockResponse();

        await createPayment(req, res);

        expect(db.query).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({error: 'Internal Server Error'});
    });
});

describe('getAllUserPayments', () => {
    const mockRequest = (params) => ({params});
    const mockResponse = () => {
        const res = {};
        res.json = jest.fn().mockReturnValue(res);
        res.status = jest.fn().mockReturnValue(res);
        return res;
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return all payments for a user with status 200', async () => {
        const mockUserId = 1;

        db.query.mockResolvedValueOnce({
            rows: [{transaction_id: 1, transaction_date: '2023-12-31', transfer_amount: 100}]
        });

        const req = mockRequest({id: mockUserId});
        const res = mockResponse();

        await getAllUserPayments(req, res);

        expect(db.query).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith([{
            transaction_id: 1,
            transaction_date: '2023-12-31',
            transfer_amount: 100
        }]);
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should handle errors and return 500 status on database error', async () => {
        const errorMessage = 'Database error';
        db.query.mockRejectedValueOnce(new Error(errorMessage));

        const req = mockRequest({id: 1});
        const res = mockResponse();

        await getAllUserPayments(req, res);

        expect(db.query).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({error: 'Internal Server Error'});
    });
});