const dbConnect = require('./config');
require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', async(req, res) => {
    res.json({ "hello": "world" });
})
// get unique list of states
app.get('/states', async(req, res) => {
    let collection = await dbConnect();
    collection = await collection.aggregate([
        {
            $group: {
                _id: "$StateSlug",
                stateName: { $first: "$StateName" },
                stateSlug: { $first: "$StateSlug" },
                districtList: { $addToSet: "$DistrictName"  },
                districtSlug: { $addToSet: "$DistrictSlug"  }
            }
        },
        {
            $project: { _id:0, stateName: 1, stateSlug: 1, districtList: 1, districtSlug: 1  }
        },
        {
            $sort: {
                stateName: 1, districtSlug: 1
            }
        }
    ]).toArray();
    res.json(collection);
})

//get all district of given state slug
app.get('/district/:stateSlug', async(req, res) => {
    console.log(req.params.stateSlug);
    let collection = await dbConnect();
    collection = await collection.aggregate([
        {
            $match: { StateSlug: req.params.stateSlug }
        },
        {
            $group: {
                _id: "$DistrictSlug",
                districtName: { $first: "$DistrictName" },
                districtSlug: { $first: "$DistrictSlug" },
                subDistrictList: { $addToSet: "$subdistname" }
            }
        },
        {
            $project: { _id:0, districtName: 1, districtSlug: 1, subDistrictList: 1  }
        },
        {
            $sort: {
                districtName: 1
            }
        }
    ]).toArray();
    res.json(collection);
})

// get detail of subdistrict of given district and city
app.get('/subdistrict/:stateSlug/:districtSlug', async (req, res) => {
    let collection = await dbConnect();
    collection = await collection.aggregate([
        {
            $match: { $and: [ { StateSlug: req.params.stateSlug }, { DistrictSlug: req.params.districtSlug  } ] }
        },
        {
            $project: { _id: 0, subdistname: 1, villagename: 1, locality_detail1: 1, locality_detail2: 1, locality_detail3: 1, OfficeName: 1, Pincode: 1 }
        }
    ]).toArray();
    res.json(collection);
} );

// get data information of given pincode 
app.get('/pincode/:pincode/', async (req, res) => {
    console.log(req.params.pincode);
    let collection = await dbConnect();
    collection = await collection.aggregate([
        {
            $match: { Pincode: req.params.pincode }
        },
        {
            $project: { _id:0, StateName:1, DistrictName: 1, subdistname: 1, villagename: 1,  locality_detail1: 1, locality_detail2: 1, locality_detail3: 1, OfficeName: 1,StateSlug: 1, DistrictSlug: 1 }
        }
    ]).toArray();
    res.json(collection);
} );


app.listen(process.env.PORT || port, () => console.log(`Example app listening at http://localhost:${port}`));
