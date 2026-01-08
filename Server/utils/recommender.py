import pandas as pd
from flask import Flask, request, jsonify
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json

# Initialize Flask Application
app = Flask(__name__)

# ==========================================
# HELPER FUNCTIONS
# ==========================================

def get_price_category(price):
    """
    Categorizes the price into 'Low', 'Medium', or 'High'.
    This creates a categorical feature from a numerical one, 
    which is easier for the CountVectorizer to process as a 'word'.
    """
    try:
        price = float(price)
        if price < 500:
            return 'Low'
        elif 500 <= price <= 1500:
            return 'Medium'
        else:
            return 'High'
    except ValueError:
        return 'Medium' # Default fallback

# ==========================================
# ML LOGIC & API ROUTE
# ==========================================

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.json
        all_vehicles = data.get('all_vehicles', [])
        last_booked = data.get('last_booked_vehicle', {})

        if not all_vehicles or not last_booked:
            return jsonify({'error': 'Invalid input: all_vehicles list and last_booked_vehicle object are required.'}), 400

        df = pd.DataFrame(all_vehicles)

        # FIX 1: Ensure columns exist before accessing them to prevent KeyError
        # We fill missing columns with empty strings or defaults
        required_cols = ['brand', 'type', 'model', 'pricePerDay', '_id']
        for col in required_cols:
            if col not in df.columns:
                df[col] = '' # Create the column if it's missing completely

        # FIX 2: Handle Null/None prices safely
        def safe_get_price_cat(price):
            if price is None: return 'Medium'
            try:
                return get_price_category(price)
            except Exception: # Catch TypeError and ValueError
                return 'Medium'

        df['price_cat'] = df['pricePerDay'].apply(safe_get_price_cat)

        # FIX 3: Robust ID Handling (Convert everything to string)
        # Handle cases where input uses 'id' instead of '_id'
        if 'id' not in df.columns and '_id' in df.columns:
            df['id'] = df['_id'].astype(str)
        elif 'id' in df.columns:
            df['id'] = df['id'].astype(str)
        else:
            # Fallback if neither exists (unlikely given FIX 1, but good for safety)
            df['id'] = df.index.astype(str)
            
        last_booked_id = str(last_booked.get('id') or last_booked.get('_id'))

        # Feature Combination (Safe Access)
        def combine_features(row):
            # Use str() to handle None/NaN values safely
            return str(row['brand']) + " " + str(row['type']) + " " + str(row['price_cat'])

        df['combined_features'] = df.apply(combine_features, axis=1)

        # ML Logic (Standard)
        cv = CountVectorizer()
        count_matrix = cv.fit_transform(df['combined_features'])

        # Create vector for the last booked car
        lb_price = safe_get_price_cat(last_booked.get('pricePerDay'))
        lb_features = str(last_booked.get('brand')) + " " + str(last_booked.get('type')) + " " + lb_price
        
        last_booked_vector = cv.transform([lb_features])
        similarity_scores = cosine_similarity(last_booked_vector, count_matrix)

        # Sort based on similarity score (second item in tuple) in descending order
        sorted_scores = sorted(list(enumerate(similarity_scores[0])), key=lambda x: x[1], reverse=True)

        recommended_vehicles = []
        for i, score in sorted_scores:
            # Safe ID access
            current_id = str(df.iloc[i]['id'])
            
            # Filter out the same car
            if current_id == last_booked_id:
                continue
                
            recommended_vehicles.append(current_id)
            if len(recommended_vehicles) >= 3:
                break

        return jsonify({'recommendations': recommended_vehicles})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run the Flask app on port 5000
    app.run(debug=True, port=5000)
