/*
* website-shared.ts
*
* Copyright (C) 2020 by RStudio, PBC
*
*/

import { join } from "path/mod.ts";

import { ld } from "lodash/mod.ts";

import { dirAndStem, pathWithForwardSlashes } from "../../../core/path.ts";

import { ProjectContext } from "../../types.ts";
import { Navbar, NavItem, Sidebar, SidebarItem } from "../../project-config.ts";
import {
  kSiteFooter,
  kSiteNavbar,
  kSitePageNavigation,
  kSiteSidebar,
  kWebsite,
  websiteConfig,
} from "./website-config.ts";
import { cookieConsentEnabled } from "./website-analytics.ts";
import { Format, FormatExtras } from "../../../config/types.ts";
import { kPageTitle, kTitle, kTitlePrefix } from "../../../config/constants.ts";

export interface Navigation {
  navbar?: Navbar;
  sidebars: Sidebar[];
  pageNavigation?: boolean;
  footer?: NavigationFooter;
}

export interface NavigationFooter {
  background?: string;
  border?: string;
  left?: string | (NavItem | string)[];
  center?: string | (NavItem | string)[];
  right?: string | (NavItem | string)[];
}

export interface NavigationPagination {
  nextPage?: SidebarItem;
  prevPage?: SidebarItem;
}

export function computePageTitle(
  format: Format,
  extras?: FormatExtras,
): string | undefined {
  const meta = extras?.metadata || {};
  const pageTitle = meta[kPageTitle] || format.metadata[kPageTitle];
  const titlePrefix = extras?.pandoc?.[kTitlePrefix] ||
    (format.metadata[kWebsite] as Record<string, unknown>)?.[kTitle];
  const title = format.metadata[kTitle];

  if (pageTitle !== undefined) {
    return pageTitle as string;
  } else if (titlePrefix !== undefined) {
    // If the title prefix is the same as the title, don't include it as a prefix
    if (titlePrefix === title) {
      return title as string;
    } else if (title !== undefined) {
      return titlePrefix + " - " + title;
    } else {
      return undefined;
    }
  } else {
    return title as string;
  }
}

export function inputFileHref(href: string) {
  const [hrefDir, hrefStem] = dirAndStem(href);
  const htmlHref = "/" + join(hrefDir, `${hrefStem}.html`);
  return pathWithForwardSlashes(htmlHref);
}

export function websiteNavigationConfig(project: ProjectContext) {
  // read navbar
  let navbar = websiteConfig(kSiteNavbar, project.config) as Navbar | undefined;
  if (typeof (navbar) !== "object") {
    navbar = undefined;
  }

  // read sidebar
  const sidebar = websiteConfig(kSiteSidebar, project.config);
  const sidebars =
    (Array.isArray(sidebar)
      ? sidebar
      : typeof (sidebar) == "object"
      ? [sidebar]
      : undefined) as Sidebar[] | undefined;

  // if there is more than one sidebar then propagate options from the
  // first sidebar to the others
  if (sidebars && sidebars.length > 1) {
    const sidebarOptions = ld.cloneDeep(sidebars[0]) as Sidebar;
    delete sidebarOptions.id;
    delete sidebarOptions.title;
    sidebarOptions.contents.splice(0, sidebarOptions.contents.length);
    for (let i = 1; i < sidebars.length; i++) {
      sidebars[i] = {
        ...sidebarOptions,
        ...sidebars[i],
      };
    }
  }

  // read the page navigation
  const pageNavigation = !!websiteConfig(kSitePageNavigation, project.config);

  // read any footer
  const footerValue = (
    value?: unknown,
  ): string | NavItem[] | undefined => {
    if (typeof (value) === "string") {
      return value as string;
    } else if (Array.isArray(value)) {
      return value as NavItem[];
    } else {
      return undefined;
    }
  };

  const footer: NavigationFooter = {};
  const footerConfig = websiteConfig(kSiteFooter, project.config);
  if (typeof (footerConfig) === "string") {
    // place the markdown in the center
    footer.center = footerConfig;
  } else {
    // Map left center and right to the footer
    footer.left = footerValue(footerConfig?.left);
    footer.center = footerValue(footerConfig?.center);
    footer.right = footerValue(footerConfig?.right);
  }

  // Ensure there is a spot for cookie-consent to place a link
  if (footer.center === undefined && cookieConsentEnabled(project)) {
    footer.center = " ";
  }

  // return
  return { navbar, sidebars, pageNavigation, footer };
}

export function flattenItems(
  sidebarItems: SidebarItem[],
  includeItem: (item: SidebarItem) => boolean,
) {
  const items: SidebarItem[] = [];
  const flatten = (sidebarItem: SidebarItem) => {
    if (includeItem(sidebarItem)) {
      items.push(sidebarItem);
    }
    if (sidebarItem.contents) {
      items.push(...flattenItems(sidebarItem.contents, includeItem));
    }
  };
  sidebarItems.forEach(flatten);
  return items;
}
