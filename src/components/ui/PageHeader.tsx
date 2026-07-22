import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  badge?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs = [],
  actions,
  badge,
}) => {
  return (
    <div className="mb-6 pb-5 border-b border-slate-200/80">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-3 font-medium">
        <Link to="/dashboard" className="hover:text-teal-700 transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            {crumb.href ? (
              <Link to={crumb.href} className="hover:text-teal-700 transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-slate-900 font-semibold">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Main Header content */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              {title}
            </h1>
            {badge && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-slate-600 font-normal mt-1 max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
