import { Fragment } from "react";
import { Link } from "react-router-dom";
import { useBreadcrumbs } from "@/hooks";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

/**
 * Renders breadcrumbs from the current route.
 *
 * @param {{ overrides?: Record<string, string> }} props
 *   overrides — replace auto-generated segment labels, e.g. { "STU-001": "John" }
 */
export default function PageBreadcrumbs({ overrides }) {
  const crumbs = useBreadcrumbs(overrides);

  if (crumbs.length <= 1) return null;

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <Fragment key={crumb.href || crumb.label || i}>
              {i > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}