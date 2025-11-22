import mongoose from 'mongoose';

const ZoomEntrySchema = new mongoose.Schema({
    gmail: {
        type: String,
        required: [true, 'Please provide a gmail address.'],
    },
    password: {
        type: String,
        required: [true, 'Please provide a password.'],
    },
    startDate: {
        type: String,
        required: [true, 'Please provide a start date.'],
    },
    endDate: {
        type: String,
        required: [true, 'Please provide an end date.'],
    },
    accountNo: {
        type: String,
        enum: ['1', '2'],
        required: [true, 'Please provide an account number.'],
    },
    mobileNumber: {
        type: String,
        required: [true, 'Please provide a mobile number.'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Duplicate the ID field to 'id' for frontend compatibility
ZoomEntrySchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete (ret as any)._id;
    },
});

export default mongoose.models.ZoomEntry || mongoose.model('ZoomEntry', ZoomEntrySchema);
