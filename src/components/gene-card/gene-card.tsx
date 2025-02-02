import { Box, Flex } from '@chakra-ui/layout';
import React from 'react';

interface GeneCardProps {
  color?: string;
  accession: string;
  geneInfo: Map<string, string>;
}

const GeneCard: React.FC<GeneCardProps> = ({ color, accession, geneInfo }) => {
  return (
    <Box as="div" px="2">
      <Flex alignItems="center" mb="4">
        <Box fontWeight="semibold" fontSize="lg" px="2" color={color}>
          {accession}
        </Box>
      </Flex>
      {geneInfo.size > 0
        ? [...geneInfo.entries()].map(([colName, cellValue]) => (
            <Flex key={`${accession}-${colName}`}>
              <Flex
                flexShrink="unset"
                ml="2"
                py="1"
                w="36"
                textTransform="uppercase"
                textColor="yellow.700"
                wordBreak="break-all"
              >
                {colName}
              </Flex>
              <Flex ml="5" py="1" wordBreak="break-all">
                {cellValue}
              </Flex>
            </Flex>
          ))
        : 'No information available for this gene.'}
    </Box>
  );
};

export default GeneCard;
