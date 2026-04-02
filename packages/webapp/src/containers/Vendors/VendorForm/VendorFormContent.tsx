// @ts-nocheck
import { Tab, Tabs } from "@blueprintjs/core";
import { Card, Group } from "@/components";
import { useState } from "react";
import { css } from '@emotion/css';
import { VendorFloatingActions } from "./VendorFloatingActions";
import { VendorFormSections } from "./VendorFormFields";
import { useIsMobile } from '@/hooks/useMobileResponsive';

const vendorFormCardClass = css`
  padding-bottom: 0 !important;
`;

const vendorFormLayoutClass = css`
  width: 100%;
  min-width: 0;

  @media (max-width: 768px) {
    gap: 16px;
  }
`;

const vendorFormTabsClass = css`
  position: sticky;
  top: 20px;

  @media (max-width: 768px) {
    position: static;
    top: auto;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow: hidden;

    .bp4-tab-list,
    .bp5-tab-list,
    .bp6-tab-list {
      overflow-x: auto;
      overflow-y: hidden;
      flex-wrap: nowrap;
      width: 100%;
      padding-bottom: 4px;
    }

    .bp4-tab,
    .bp5-tab,
    .bp6-tab {
      white-space: nowrap;
      flex: 0 0 auto;
    }
  }
`;

const vendorFormSectionsClass = css`
  min-width: 0;
  width: 100%;
  max-width: 100%;
`;

export function VendorFormContent() {
  const [selectedTabId, setSelectedTabId] = useState('primary');
  const isMobile = useIsMobile();

  const handleTabChange = (tabId: string) => {
    const sectionId = String(tabId);
    setSelectedTabId(sectionId);

    const section = document.querySelector(
      `[data-section-id="${sectionId}"]`,
    );
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Card className={vendorFormCardClass}>
      <Group
        verticalAlign={'top'}
        alignItems={isMobile ? 'stretch' : 'flex-start'}
        flexDirection={isMobile ? 'column' : 'row'}
        noWrap={!isMobile}
        w="100%"
        minWidth={0}
        className={vendorFormLayoutClass}
      >
        <Tabs
          selectedTabId={selectedTabId}
          onChange={handleTabChange}
          className={vendorFormTabsClass}
          vertical={!isMobile}
        >
          <Tab id={'primary'} title={'Basic'} />
          <Tab id={'financial'} title={'Financial'} />
          <Tab id={'billingAddress'} title={'Billing address'} />
          <Tab id={'shippingAddress'} title={'Shipping address'} />
          <Tab id={'notes'} title={'Notes'} />
        </Tabs>
        <div className={vendorFormSectionsClass}>
          <VendorFormSections />
        </div>
      </Group>
      <VendorFloatingActions />
    </Card>
  )
}
