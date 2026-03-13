import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';

describe('UI Components', () => {
    describe('Badge', () => {
        it('should render children text', () => {
            render(<Badge>Active</Badge>);
            expect(screen.getByText('Active')).toBeInTheDocument();
        });

        it('should apply color as inline style', () => {
            const { container } = render(<Badge color="#E8621A">Test</Badge>);
            const badge = container.firstChild;
            // jsdom converts hex to rgb/rgba
            expect(badge.style.backgroundColor).toBeTruthy();
            expect(badge.style.color).toBe('rgb(232, 98, 26)');
        });

        it('should apply default color when none provided', () => {
            const { container } = render(<Badge>Default</Badge>);
            const badge = container.firstChild;
            expect(badge.style.color).toBe('rgb(161, 161, 170)');
        });

        it('should apply custom className', () => {
            const { container } = render(<Badge className="my-badge">Test</Badge>);
            expect(container.firstChild.className).toContain('my-badge');
        });
    });

    describe('Card', () => {
        it('should render children', () => {
            render(<Card>Card Content</Card>);
            expect(screen.getByText('Card Content')).toBeInTheDocument();
        });

        it('should apply custom className', () => {
            const { container } = render(<Card className="custom-class">Test</Card>);
            expect(container.firstChild.className).toContain('custom-class');
        });
    });

    describe('EmptyState', () => {
        it('should render title', () => {
            render(<EmptyState title="No Items" />);
            expect(screen.getByText('No Items')).toBeInTheDocument();
        });

        it('should render description when provided', () => {
            render(<EmptyState title="Empty" description="Add items" />);
            expect(screen.getByText('Add items')).toBeInTheDocument();
        });

        it('should use default title when none provided', () => {
            render(<EmptyState />);
            expect(screen.getByText('No data found')).toBeInTheDocument();
        });

        it('should render custom icon', () => {
            const MockIcon = ({ size, className }) => (
                <span data-testid="mock-icon" className={className}>icon</span>
            );
            render(<EmptyState icon={MockIcon} title="Empty" />);
            expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
        });

        it('should render action when provided', () => {
            render(
                <EmptyState
                    title="Empty"
                    action={<button>Add Item</button>}
                />
            );
            expect(screen.getByText('Add Item')).toBeInTheDocument();
        });
    });

    describe('Skeleton', () => {
        it('should render with skeleton class', () => {
            const { container } = render(<Skeleton className="h-8" />);
            expect(container.firstChild.className).toContain('skeleton');
            expect(container.firstChild.className).toContain('h-8');
        });

        it('should render multiple skeletons with count prop', () => {
            const { container } = render(<Skeleton count={3} className="h-4" />);
            const skeletons = container.querySelectorAll('.skeleton');
            expect(skeletons).toHaveLength(3);
        });

        it('should render 1 skeleton by default', () => {
            const { container } = render(<Skeleton />);
            const skeletons = container.querySelectorAll('.skeleton');
            expect(skeletons).toHaveLength(1);
        });
    });
});
