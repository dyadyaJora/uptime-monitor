let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let siteSchema = new Schema({
    url: {
        type: String,
        required: true,
    },
    delay: {
        type: Number,
        default: 360000 // мс
    },
    status_content: Number,
    active: Boolean,
    in_query: Boolean,
    last_update: { type: Date, default: Date.now },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true
});

mongoose.model('Site', siteSchema);