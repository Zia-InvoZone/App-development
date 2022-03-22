import React, { useState } from "react";
import gql from "graphql-tag";
import { Query } from "react-apollo";
import {
  Card,
  ResourceList,
  Stack,
  TextStyle,
  Thumbnail,
} from "@shopify/polaris";
import store from "store-js";
import ApplyRandomPrices from "./ApplyRandomPrices";

// GraphQL query that retrieves products by ID
const GET_PRODUCTS_BY_ID = gql`
  query getProducts($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        title
        handle
        descriptionHtml
        id
        images(first: 1) {
          edges {
            node {
              id
              altText
            }
          }
        }
        variants(first: 1) {
          edges {
            node {
              price
              id
            }
          }
        }
      }
    }
  }
`;

const ResourceListWithProducts = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedNodes, setSelectedNodes] = useState({});

  console.log("selectedItems", selectedItems);
  console.log("selectedNodes", selectedNodes);
  // Returns products by ID
  return (
    <Query query={GET_PRODUCTS_BY_ID} variables={{ ids: store.get("ids") }}>
      {({ data, loading, error, refetch }) => {
        // Refetches products by ID
        if (loading) return <div>Loading…</div>;
        if (error) return <div>{error.message}</div>;

        const nodesById = {};
        data.nodes.forEach((node) => (nodesById[node.id] = node));
        // console.log("nodesById", nodesById);
        return (
          <>
            <Card>
              <ResourceList
                showHeader
                resourceName={{ singular: "Product", plural: "Products" }}
                items={data.nodes}
                selectable
                selectedItems={selectedItems}
                onSelectionChange={(selectedItems) => {
                  const selectedNodes = {};
                  selectedItems.forEach(
                    (item) => (selectedNodes[item] = nodesById[item])
                  );
                  setSelectedItems(selectedItems);
                  setSelectedNodes(selectedNodes);
                }}
                renderItem={(item) => {
                  const media = (
                    <Thumbnail
                      source={
                        item.images.edges[0] ? item.images.edges[0].node.id : ""
                      }
                      alt={
                        item.images.edges[0]
                          ? item.images.edges[0].node.altText
                          : ""
                      }
                    />
                  );
                  const price = item.variants.edges[0].node.price;
                  return (
                    <ResourceList.Item
                      id={item.id}
                      media={media}
                      accessibilityLabel={`View details for ${item.title}`}
                      verticalAlignment="center"
                      onClick={() => {
                        let index = selectedItems.indexOf(item.id);
                        const node = nodesById[item.id];
                        if (index === -1) {
                          selectedItems.push(item.id);
                          selectedNodes[item.id] = node;
                        } else {
                          selectedItems.splice(index, 1);
                          delete selectedNodes[item.id];
                        }

                        // this.setState({
                        //   selectedItems: this.state.selectedItems,
                        //   selectedNodes: this.state.selectedNodes,
                        // });
                      }}
                    >
                      <Stack alignment="center">
                        <Stack.Item fill>
                          <h3>
                            <TextStyle variation="strong">
                              {item.title}
                            </TextStyle>
                          </h3>
                        </Stack.Item>
                        <Stack.Item>
                          <p>${price}</p>
                        </Stack.Item>
                      </Stack>
                    </ResourceList.Item>
                  );
                }}
              />
            </Card>

            <ApplyRandomPrices
              selectedItems={selectedNodes}
              onUpdate={refetch}
              setSelectedItems={setSelectedItems}
            />
          </>
        );
      }}
    </Query>
  );
};

export default ResourceListWithProducts;
