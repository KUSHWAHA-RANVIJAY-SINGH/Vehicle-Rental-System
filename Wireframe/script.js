// Vehicle Data
const vehicles = [
    {
        id: 1,
        name: "Toyota Corolla",
        type: "economy",
        image: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Toyota/Toyota-Corolla/4538/1544534285920/front-left-side-47.jpg",
        specs: ["5 Seats", "Automatic", "Air Conditioning"],
        price: 450,
        badge: "Popular"
    },
    {
        id: 2,
        name: "Honda CR-V",
        type: "suv",
        image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        specs: ["7 Seats", "Automatic", "Air Conditioning"],
        price: 650,
        badge: "Family Choice"
    },
    {
        id: 3,
        name: "BMW 3 Series",
        type: "luxury",
        image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        specs: ["5 Seats", "Automatic", "Premium Sound"],
        price: 950,
        badge: "Luxury"
    },
    {
        id: 4,
        name: "Ford Mustang",
        type: "sports",
        image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        specs: ["4 Seats", "Manual", "Sports Package"],
        price: 1200,
        badge: "Sports"
    },
    {
        id: 5,
        name: "Hyundai Elantra",
        type: "economy",
        image: "https://hips.hearstapps.com/hmg-prod/images/2024-hyundai-elantra-n-lightning-lap-2025-178-67b0a408c7cd0.jpg?crop=0.498xw:0.373xh;0.285xw,0.387xh&resize=1200:*",
        specs: ["5 Seats", "Automatic", "Fuel Efficient"],
        price: 400,
        badge: "Economy"
    },
    {
        id: 6,
        name: "Mercedes-Benz S-Class",
        type: "luxury",
        image: "https://stimg.cardekho.com/images/carexteriorimages/930x620/Mercedes-Benz/S-Class/10853/1690451611932/front-left-side-47.jpg",
        specs: ["5 Seats", "Automatic", "Premium Features"],
        price: 1500,
        badge: "Premium"
    },
    {
        id: 7,
        name: "Royal Enfield Classic 350",
        type: "bike",
        image: "https://imgd.aeplcdn.com/664x374/n/cw/ec/183389/classic-350-right-front-three-quarter-2.jpeg?isig=0&q=80",
        specs: ["1 Seats", "Manual", "Fuel Efficient"],
        price: 600,
        badge: "Classic"
    },
    {
        id: 8,
        name: "Honda CB Hornet 160R",
        type: "bike",
        image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        specs: ["2 Seats", "Manual", "Sporty Design"],
        price: 500,
        badge: "Sporty"
    },
    {
        id: 9,
        name: "Bajaj Pulsar NS200",
        type: "bike",
        image: "https://cdn.bikedekho.com/processedimages/bajaj/bajaj-pulsar-200-ns/source/bajaj-pulsar-200-ns68a6c52da4533.jpg?imwidth=412&impolicy=resize",
        specs: ["2 Seats", "Manual", "High Performance"],
        price: 550,
        badge: "Performance"
    },
    {
        id: 10,
        name: "TVS Apache RTR 160",
        type: "bike",
        image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        specs: ["2 Seats", "Manual", "Racing DNA"],
        price: 450,
        badge: "Racing"
    }
];

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const bookingModal = document.getElementById('bookingModal');
const closeButtons = document.querySelectorAll('.close-modal');
const vehicleGrid = document.getElementById('vehicleGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const searchVehiclesBtn = document.getElementById('searchVehicles');
const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('switchToLogin');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const nav = document.querySelector('nav');
const testimonialDots = document.querySelectorAll('.dot');
const testimonials = document.querySelectorAll('.testimonial');
const loadingSpinner = document.getElementById('loadingSpinner');

// Current filter
let currentFilter = 'all';
let currentTestimonial = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    // Load vehicles
    renderVehicles(vehicles);

    // Set minimum date for date inputs to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('pickupDate').min = today;
    document.getElementById('returnDate').min = today;
    document.getElementById('bookingPickup').min = today;
    document.getElementById('bookingReturn').min = today;

    // Start testimonial slider
    startTestimonialSlider();
});

// Render vehicles to the grid
function renderVehicles(vehiclesToRender) {
    vehicleGrid.innerHTML = '';

    if (vehiclesToRender.length === 0) {
        vehicleGrid.innerHTML = '<div class="no-vehicles">No vehicles found matching your criteria.</div>';
        return;
    }

    vehiclesToRender.forEach(vehicle => {
        const vehicleCard = document.createElement('div');
        vehicleCard.className = 'vehicle-card';
        vehicleCard.setAttribute('data-type', vehicle.type);

        vehicleCard.innerHTML = `
            <div class="vehicle-image">
                <img src="${vehicle.image}" alt="${vehicle.name}">
                ${vehicle.badge ? `<div class="vehicle-badge">${vehicle.badge}</div>` : ''}
            </div>
            <div class="vehicle-details">
                <h3 class="vehicle-name">${vehicle.name}</h3>
                <div class="vehicle-specs">
                    ${vehicle.specs.map(spec => `<span><i class="fas fa-check"></i> ${spec}</span>`).join('')}
                </div>
                <div class="vehicle-price">
                    <div class="price">₹${vehicle.price}<span>/day</span></div>
                    <button class="rent-btn" data-vehicle='${JSON.stringify(vehicle).replace(/'/g, "&#39;")}'>
                        <i class="fas fa-calendar-plus"></i> Rent Now
                    </button>
                </div>
            </div>
        `;

        vehicleGrid.appendChild(vehicleCard);
    });

    // Add event listeners to rent buttons
    document.querySelectorAll('.rent-btn').forEach(button => {
        button.addEventListener('click', function () {
            const vehicleData = JSON.parse(this.getAttribute('data-vehicle').replace(/&#39;/g, "'"));
            openBookingModal(vehicleData);
        });
    });
}

// Filter vehicles by type
filterButtons.forEach(button => {
    button.addEventListener('click', function () {
        // Update active filter button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        currentFilter = this.getAttribute('data-filter');

        // Filter vehicles
        const filteredVehicles = currentFilter === 'all'
            ? vehicles
            : vehicles.filter(vehicle => vehicle.type === currentFilter);

        renderVehicles(filteredVehicles);
    });
});

// Search vehicles
searchVehiclesBtn.addEventListener('click', function () {
    const location = document.getElementById('pickupLocation').value;
    const pickupDate = document.getElementById('pickupDate').value;
    const returnDate = document.getElementById('returnDate').value;
    const vehicleType = document.getElementById('vehicleType').value;

    // Show loading spinner
    showLoading();

    // Simulate API call delay
    setTimeout(() => {
        let filteredVehicles = vehicles;

        // Filter by vehicle type if selected
        if (vehicleType) {
            filteredVehicles = filteredVehicles.filter(vehicle => vehicle.type === vehicleType);
        }

        // In a real app, we would send the search criteria to the server
        // For this demo, we'll just filter by type and show a message
        renderVehicles(filteredVehicles);

        // Hide loading spinner
        hideLoading();

        // Scroll to vehicles section
        document.getElementById('vehicles').scrollIntoView({ behavior: 'smooth' });

        // Show notification
        showNotification(`Found ${filteredVehicles.length} vehicles matching your criteria`, 'success');
    }, 1000);
});

// Modal functionality
loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'flex';
});

registerBtn.addEventListener('click', () => {
    registerModal.style.display = 'flex';
});

// Switch between login and register modals
switchToRegister.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'none';
    registerModal.style.display = 'flex';
});

switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    registerModal.style.display = 'none';
    loginModal.style.display = 'flex';
});

// Close modals
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
        bookingModal.style.display = 'none';
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }

    if (e.target === registerModal) {
        registerModal.style.display = 'none';
    }
    if (e.target === bookingModal) {
        bookingModal.style.display = 'none';
    }
});

// Open booking modal with vehicle data
function openBookingModal(vehicle) {
    document.getElementById('bookingVehicleImage').src = vehicle.image;
    document.getElementById('bookingVehicleName').textContent = vehicle.name;
    document.getElementById('bookingVehicleSpecs').textContent = vehicle.specs.join(' • ');
    document.getElementById('bookingVehiclePrice').textContent = `₹${vehicle.price}`;

    // Calculate rental total
    updateBookingTotal(vehicle.price);

    bookingModal.style.display = 'flex';
}

// Update booking total based on dates and vehicle price
function updateBookingTotal(pricePerDay) {
    const pickupDateInput = document.getElementById('bookingPickup').value;
    const returnDateInput = document.getElementById('bookingReturn').value;

    // Default to 3 days if dates are not selected
    let days = 3;

    if (pickupDateInput && returnDateInput) {
        const pickupDate = new Date(pickupDateInput);
        const returnDate = new Date(returnDateInput);

        if (returnDate > pickupDate) {
            days = Math.ceil((returnDate - pickupDate) / (1000 * 60 * 60 * 24));
        }
    }

    const rentalFee = days * pricePerDay;
    const insurance = 25;
    const taxes = 18;
    const total = rentalFee + insurance + taxes;

    document.getElementById('rentalFee').textContent = `₹${rentalFee}`;
    document.getElementById('bookingTotal').textContent = `₹${total}`;
}

// Add event listeners to booking date inputs
document.getElementById('bookingPickup').addEventListener('change', function () {
    const vehiclePrice = parseInt(document.getElementById('bookingVehiclePrice').textContent.replace('₹', ''));
    updateBookingTotal(vehiclePrice);
});

document.getElementById('bookingReturn').addEventListener('change', function () {
    const vehiclePrice = parseInt(document.getElementById('bookingVehiclePrice').textContent.replace('₹', ''));
    updateBookingTotal(vehiclePrice);
});

// Form submissions
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    showLoading();

    // Simulate API call
    setTimeout(() => {
        hideLoading();
        loginModal.style.display = 'none';
        showNotification('Login successful!', 'success');
    }, 1500);
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    showLoading();

    // Simulate API call
    setTimeout(() => {
        hideLoading();
        registerModal.style.display = 'none';
        showNotification('Registration successful! Please check your email to verify your account.', 'success');
    }, 1500);
});

document.getElementById('bookingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    showLoading();

    // Simulate API call
    setTimeout(() => {
        hideLoading();
        bookingModal.style.display = 'none';
        showNotification('Booking confirmed! You will receive a confirmation email shortly.', 'success');
    }, 2000);
});

// Mobile menu toggle
mobileMenuBtn.addEventListener('click', () => {
    nav.classList.toggle('active');
});

// Testimonial slider functionality
function startTestimonialSlider() {
    setInterval(() => {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    }, 5000);
}

function showTestimonial(index) {
    testimonials.forEach(testimonial => testimonial.classList.remove('active'));
    testimonialDots.forEach(dot => dot.classList.remove('active'));

    testimonials[index].classList.add('active');
    testimonialDots[index].classList.add('active');
}

// Testimonial dots click events
testimonialDots.forEach(dot => {
    dot.addEventListener('click', function () {
        const index = parseInt(this.getAttribute('data-index'));
        showTestimonial(index);
        currentTestimonial = index;
    });
});

// Filter vehicles from footer links
document.querySelectorAll('.footer-section a[data-filter]').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const filter = this.getAttribute('data-filter');

        // Update active filter button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`.filter-btn[data-filter="${filter}"]`).classList.add('active');

        // Filter vehicles
        currentFilter = filter;
        const filteredVehicles = currentFilter === 'all'
            ? vehicles
            : vehicles.filter(vehicle => vehicle.type === currentFilter);

        renderVehicles(filteredVehicles);

        // Scroll to vehicles section
        document.getElementById('vehicles').scrollIntoView({ behavior: 'smooth' });
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });

            // Close mobile menu if open
            nav.classList.remove('active');
        }
    });
});

// Show loading spinner
function showLoading() {
    loadingSpinner.style.display = 'flex';
}

// Hide loading spinner
function hideLoading() {
    loadingSpinner.style.display = 'none';
}

// Show notification
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    // Add styles for notification
    if (!document.querySelector('.notification')) {
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                z-index: 4000;
                animation: slideInRight 0.3s ease;
                border-left: 4px solid var(--success);
            }
            
            .notification.error {
                border-left-color: var(--accent);
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 0.8rem;
            }
            
            .notification i {
                font-size: 1.2rem;
                color: var(--success);
            }
            
            .notification.error i {
                color: var(--accent);
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Add animation on scroll
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements to animate
    document.querySelectorAll('.feature-card, .vehicle-card, .step').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

// Initialize scroll animations when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
} else {
    initScrollAnimations();
}