import axios from 'axios';

const API_URL = 'http://localhost:5000/api/vehicles';

async function verifySlugs() {
         try {
                  console.log('Fetching all vehicles to get sample slugs...');
                  const { data: vehicles } = await axios.get(API_URL);

                  if (vehicles.length === 0) {
                           console.log('No vehicles found to test.');
                           return;
                  }

                  const sampleVehicle = vehicles[0];
                  const slug = sampleVehicle.slug;
                  const id = sampleVehicle._id;

                  console.log(`Testing vehicle: ${sampleVehicle.name}`);
                  console.log(`- ID: ${id}`);
                  console.log(`- Slug: ${slug}`);

                  // Test fetch by Slug
                  console.log(`\nFetching by Slug: ${API_URL}/${slug}`);
                  const { data: bySlug } = await axios.get(`${API_URL}/${slug}`);

                  if (bySlug._id === id) {
                           console.log('✅ Success: Fetched correct vehicle by slug.');
                  } else {
                           console.error('❌ Failed: IDs do not match.');
                  }

                  // Test fetch by ID (Backward compatibility)
                  console.log(`\nFetching by ID: ${API_URL}/${id}`);
                  const { data: byId } = await axios.get(`${API_URL}/${id}`);

                  if (byId.slug === slug) {
                           console.log('✅ Success: Fetched correct vehicle by ID.');
                  } else {
                           console.error('❌ Failed: Slugs do not match.');
                  }

                  // Test Availability endpoint with Slug
                  console.log(`\nTesting Availability with Slug...`);
                  // Future dates
                  const start = new Date();
                  start.setDate(start.getDate() + 30);
                  const end = new Date();
                  end.setDate(end.getDate() + 31);

                  try {
                           await axios.get(`${API_URL}/${slug}/availability?start=${start.toISOString()}&end=${end.toISOString()}`);
                           console.log('✅ Success: Availability endpoint works with slug.');
                  } catch (e) {
                           console.error('❌ Failed: Availability endpoint error with slug.', e.message);
                  }

         } catch (error) {
                  console.error('Verification failed:', error.message);
                  if (error.response) console.error('Response:', error.response.data);
         }
}

verifySlugs();
