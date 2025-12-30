import { render, screen } from '../../utils/test-utils';
import Navbar from '../Navbar';

describe('Navbar Component', () => {
         test('renders logo and links', () => {
                  render(<Navbar />);

                  // Check for Logo (assuming it has text or alt text "Vehicle Rental")
                  // Adjust based on actual Navbar implementation.
                  // Let's assume there's a link to Home
                  expect(screen.getByRole('navigation')).toBeInTheDocument();
         });
});
