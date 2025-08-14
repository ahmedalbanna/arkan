
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PricingCard } from '@/components/PricingCard';
import type { PricingPlan } from '@/lib/types';
import { useRouter } from 'next/navigation';

// Mock the useRouter hook
const mockedUseRouter = useRouter as jest.Mock;
const pushMock = jest.fn();
mockedUseRouter.mockReturnValue({
  push: pushMock,
});

describe('PricingCard', () => {
  const mockPlan: PricingPlan = {
    id: 'professional',
    name: 'Professional',
    price: 15,
    credits: 200,
    features: ['200 AI Credits', 'Full Document Generation', 'Priority Support'],
    isPopular: true,
  };

  it('renders the plan details correctly', () => {
    render(<PricingCard plan={mockPlan} />);
    expect(screen.getByText('Professional')).toBeInTheDocument();
    expect(screen.getByText('$15')).toBeInTheDocument();
    expect(screen.getByText('200 AI Credits')).toBeInTheDocument();
    expect(screen.getByText('Full Document Generation')).toBeInTheDocument();
    expect(screen.getByText('Priority Support')).toBeInTheDocument();
  });

  it('displays the "Most Popular" badge when isPopular is true', () => {
    render(<PricingCard plan={mockPlan} />);
    expect(screen.getByText('pricing.mostPopular')).toBeInTheDocument();
  });

  it('does not display the "Most Popular" badge when isPopular is false or undefined', () => {
    const basicPlan = { ...mockPlan, isPopular: false };
    render(<PricingCard plan={basicPlan} />);
    expect(screen.queryByText('pricing.mostPopular')).not.toBeInTheDocument();
  });

  it('navigates to the payment submission page with correct params on button click', () => {
    render(<PricingCard plan={mockPlan} />);
    const selectButton = screen.getByRole('button', { name: 'pricing.selectPlanButton' });
    fireEvent.click(selectButton);

    const expectedParams = new URLSearchParams({
      planId: mockPlan.id,
      planName: mockPlan.name,
      credits: mockPlan.credits.toString(),
      price: mockPlan.price.toString(),
    });
    
    expect(pushMock).toHaveBeenCalledWith(`/payment/submit?${expectedParams.toString()}`);
  });
});
