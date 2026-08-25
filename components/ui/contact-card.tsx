import React from 'react';
import { cn } from '@/lib/utils';
import {
    LucideIcon,
    PlusIcon,
} from 'lucide-react';

type ContactInfoProps = React.ComponentProps<'div'> & {
    icon: LucideIcon;
    label: string;
    value: string;
};

type ContactCardProps = React.ComponentProps<'div'> & {
    // Content props
    title?: string;
    description?: string;
    contactInfo?: ContactInfoProps[];
    titleClassName?: string;
    formSectionClassName?: string;
};

export function ContactCard({
    title = 'Contact With Us',
    description = 'If you have any questions regarding our Services or need help, please fill out the form here. We do our best to respond within 1 business day.',
    contactInfo,
    className,
    titleClassName,
    formSectionClassName,
    children,
    ...props
}: ContactCardProps) {
    return (
        <div
            className={cn(
                'bg-card border relative grid h-full w-full shadow md:grid-cols-2 lg:grid-cols-3',
                className,
            )}
            {...props}
        >
            <PlusIcon className="absolute -top-3 -left-3 h-6 w-6" />
            <PlusIcon className="absolute -top-3 -right-3 h-6 w-6" />
            <PlusIcon className="absolute -bottom-3 -left-3 h-6 w-6" />
            <PlusIcon className="absolute -right-3 -bottom-3 h-6 w-6" />
            <div className="flex flex-col justify-between lg:col-span-2">
                {/* Copy top, contact rows bottom: the form column is taller than
                    the copy, so the leftover height belongs between them. */}
                <div className="relative flex h-full flex-col justify-between gap-10 px-4 py-8 md:p-8">
                    <div className="space-y-4">
                        {/* h2, not h1: the hero owns the page's only h1. */}
                        <h2
                            className={cn(
                                'text-3xl font-bold md:text-4xl lg:text-5xl',
                                titleClassName,
                            )}
                        >
                            {title}
                        </h2>
                        <p className="text-muted-foreground max-w-xl text-sm md:text-base lg:text-lg">
                            {description}
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
                        {contactInfo?.map((info, index) => (
                            <ContactInfo key={index} {...info} />
                        ))}
                    </div>
                </div>
            </div>
            <div
                className={cn(
                    'bg-muted/40 flex h-full w-full items-center border-t p-5 md:col-span-1 md:border-t-0 md:border-l',
                    formSectionClassName,
                )}
            >
                {children}
            </div>
        </div>
    );
}

function ContactInfo({
    icon: Icon,
    label,
    value,
    className,
    ...props
}: ContactInfoProps) {
    return (
        <div className={cn('flex items-center gap-3 py-3', className)} {...props}>
            <div className="bg-muted/40 rounded-lg p-3">
                <Icon className="h-5 w-5" />
            </div>
            <div>
                <p className="font-medium">{label}</p>
                <p className="text-muted-foreground text-xs">{value}</p>
            </div>
        </div>
    );
}
