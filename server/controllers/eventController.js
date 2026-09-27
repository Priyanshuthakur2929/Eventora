const Event = require('../models/Event.js');

exports.getAllEvents = async(req,res)=>{
    try{                                      
        const filters = {};
        const search = req.query.search?.trim();
        if(search){
            filters.title = { $regex: search, $options: 'i' };
        }
        if(req.query.cateogary){
            filters.cateogary =  req.query.cateogary;
        }
        if(req.query.location){
            filters.location = req.query.location;
        }

        const events = await Event.find(filters);
        res.json(events);
    }catch(error){
        res.status(500).json({message:error.message});
    }                                          
};
  // FIND EVENT BY ID-----------
exports.getAllEventById = async(req,res)=>{
    try{
        const event = await Event.findById(req.params.id);
        if (!event){
            return res.status(404).json({message:"Event not found"});
        }
        res.json(event);
    }catch(error){
        res.status(500).json({message:error.message});
    }
}
  // CREATE EVENT-------
exports.createEvent = async(req,res)=>{
    const{title,description,date,location,category,cateogary,totalSeats,ticketPrice,image,imageUrl} = req.body;
    try{
        const event = await Event.create({
            title,
            description,
            date,
            location,
            cateogary: category || cateogary,
            totalSeats,
            availableSeats: totalSeats,
            ticketPrice,
            imageUrl: image || imageUrl,
            createdBy: req.user._id
        });
        res.status(201).json(event);
    }catch(error){
        res.status(500).json({message:error.message});
    }
  };

   // UPDATE EVENT ------------

    exports.updateEvent = async(req,res)=>{
const{title,description,date,location,cateogary,totalSeats,ticketPrice,imageUrl} = req.body;
    try{
        const event = await Event.findByIdAndUpdate(req.params.id, {
            title,
            description,
            date,
            location,
            cateogary,
            totalSeats,
            ticketPrice,
            imageUrl
        }, { returnDocument: 'after', runValidators: true });

        if (!event){
            return res.status(404).json({message:"Event not found"});
        }

        res.json(event);
    }catch(error){
        res.status(500).json({message:error.message});
    }
  };

  // DELETE EVENT-------
  exports.deleteEvent = async(req,res)=>{
  try{
    const event = await Event.findByIdAndDelete(req.params.id);
    if(!event){
        return res.status(404).json({message:'Event not found'})
    }
    res.json(({message:"Event deleted successfully"}));
  }catch(error){
    res.status(500).json({message:error.message});
  }
  };