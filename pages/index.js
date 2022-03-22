import React, { useState } from "react";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { Page, Layout, EmptyState } from "@shopify/polaris";
import { ResourcePicker, TitleBar } from "@shopify/app-bridge-react";
import store from "store-js";
import ResourceListWithProducts from "./components/ResourceList";

export default function Index() {
  const [open, setOpen] = useState(false);
  const img =
    "https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg";

  const handleSelection = (resources) => {
    const idsFromResources = resources.selection.map((product) => product.id);
    store.set("ids", idsFromResources);
    setOpen(false);
  };

  const emptyState = !store.get("ids");

  return (
    <Page>
      <TitleBar
        primaryAction={{
          content: "Select products",
          onAction: () => setOpen(true),
        }}
      />
      <ResourcePicker // Resource picker component
        resourceType="Product"
        showVariants={false}
        open={open}
        onSelection={(resources) => handleSelection(resources)}
        onCancel={() => setOpen(false)}
      />
      {emptyState ? (
        <Layout>
          <EmptyState // Empty state component
            heading="Discount your products temporarily"
            action={{
              content: "Select products",
              onAction: () => setOpen(true),
            }}
            image={img}
          >
            <p>Select products to change their price temporarily.</p>
          </EmptyState>

        </Layout>
      ) : (
        <ResourceListWithProducts />
      )}
    </Page>
  );
}
