import { render, screen } from '@testing-library/react';
import Card from '@/components/ui/Card';

describe('Card Component', () => {
  it('should render children', () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('should apply hover class when hover prop is true', () => {
    render(<Card hover>Hover Card</Card>);
    const card = screen.getByText('Hover Card').closest('div');
    expect(card).toHaveClass('card-hover');
  });

  it('should apply custom className', () => {
    render(<Card className="custom-class">Custom Card</Card>);
    const card = screen.getByText('Custom Card').closest('div');
    expect(card).toHaveClass('custom-class');
  });

  it('should handle padding prop', () => {
    const { rerender } = render(<Card padding="none">No Padding</Card>);
    let card = screen.getByText('No Padding').closest('div');
    // padding="none" doesn't add any padding class, just empty string
    expect(card).not.toHaveClass('p-4', 'p-6', 'p-8');

    rerender(<Card padding="sm">Small Padding</Card>);
    card = screen.getByText('Small Padding').closest('div');
    expect(card).toHaveClass('p-4');

    rerender(<Card padding="md">Medium Padding</Card>);
    card = screen.getByText('Medium Padding').closest('div');
    expect(card).toHaveClass('p-6');

    rerender(<Card padding="lg">Large Padding</Card>);
    card = screen.getByText('Large Padding').closest('div');
    expect(card).toHaveClass('p-8');
  });
});

