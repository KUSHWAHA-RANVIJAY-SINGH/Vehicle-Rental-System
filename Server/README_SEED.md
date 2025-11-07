# Seed Vehicles with Images

This script adds sample vehicles (cars and bikes) to your database with real images from Unsplash.

## 🚀 How to Use

### Step 1: Make sure your server is set up
- MongoDB is running
- `.env` file is configured
- Dependencies are installed

### Step 2: Run the seed script

```bash
cd Server
npm run seed-vehicles
```

### Step 3: Verify

The script will add:
- **10 Cars**: Toyota Camry, Honda Accord, BMW 3 Series, Mercedes C-Class, Tesla Model 3, Ford Mustang, Audi A4, Jeep Wrangler, Nissan Altima, Chevrolet Tahoe
- **8 Bikes**: Harley-Davidson Sportster, Honda CBR600RR, Yamaha R1, Ducati Panigale V4, Kawasaki Ninja 650, BMW R1250GS, Triumph Street Triple, Suzuki Hayabusa

All vehicles include:
- ✅ Real images from Unsplash
- ✅ Detailed descriptions
- ✅ Features list
- ✅ Pricing information
- ✅ Location data
- ✅ Availability status

## 📸 Image Sources

Images are loaded from Unsplash (free, high-quality stock photos):
- Car images: Various professional car photography
- Bike images: Motorcycle photography

If images don't load:
- Check your internet connection
- Images are loaded from external URLs (Unsplash)
- Fallback placeholders are available

## 🔄 Re-seeding

To add vehicles again:
- The script will add new vehicles without deleting existing ones
- To clear and re-seed, uncomment the delete line in `seedVehicles.js`:
  ```javascript
  await Vehicle.deleteMany({});
  ```

## ✏️ Customizing

Edit `Server/scripts/seedVehicles.js` to:
- Add more vehicles
- Change images (use any image URL)
- Modify prices, features, descriptions
- Add your own vehicle data

## 📝 Notes

- All images are hosted externally (Unsplash)
- For production, consider hosting images on your own server or cloud storage
- Image URLs are stored in the `images` array in each vehicle document

