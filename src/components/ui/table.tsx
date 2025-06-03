import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";

interface TableProps {
  /**
   * Optional style for the outer container.
   */
  style?: ViewStyle;
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ style, children }) => {
  return (
    <View style={[styles.tableContainer, style]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableInner}>{children}</View>
      </ScrollView>
    </View>
  );
};

interface TableHeaderProps {
  style?: ViewStyle;
  children: React.ReactNode;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ style, children }) => {
  return <View style={[styles.headerContainer, style]}>{children}</View>;
};

interface TableBodyProps {
  style?: ViewStyle;
  children: React.ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({ style, children }) => {
  return <View style={[styles.bodyContainer, style]}>{children}</View>;
};

interface TableFooterProps {
  style?: ViewStyle;
  children: React.ReactNode;
}

export const TableFooter: React.FC<TableFooterProps> = ({ style, children }) => {
  return <View style={[styles.footerContainer, style]}>{children}</View>;
};

interface TableRowProps {
  /**
   * If true, apply "selected" background color.
   */
  selected?: boolean;
  style?: ViewStyle;
  children: React.ReactNode;
}

export const TableRow: React.FC<TableRowProps> = ({
  selected = false,
  style,
  children,
}) => {
  return (
    <View
      style={[
        styles.rowContainer,
        selected && styles.rowSelected,
        style,
      ]}
    >
      {children}
    </View>
  );
};

interface TableHeadProps {
  style?: ViewStyle;
  children: React.ReactNode;
  /**
   * If a header contains a checkbox, pass `hasCheckbox={true}` to remove right padding.
   */
  hasCheckbox?: boolean;
}

export const TableHead: React.FC<TableHeadProps> = ({
  style,
  children,
  hasCheckbox = false,
}) => {
  return (
    <View
      style={[
        styles.headCell,
        hasCheckbox && styles.headCellCheckbox,
        style,
      ]}
    >
      <Text style={styles.headText}>{children}</Text>
    </View>
  );
};

interface TableCellProps {
  style?: ViewStyle;
  children: React.ReactNode;
  /**
   * If a cell contains a checkbox, pass `hasCheckbox={true}` to remove right padding.
   */
  hasCheckbox?: boolean;
}

export const TableCell: React.FC<TableCellProps> = ({
  style,
  children,
  hasCheckbox = false,
}) => {
  return (
    <View
      style={[
        styles.cell,
        hasCheckbox && styles.cellCheckbox,
        style,
      ]}
    >
      <Text style={styles.cellText}>{children}</Text>
    </View>
  );
};

interface TableCaptionProps {
  style?: TextStyle;
  children: React.ReactNode;
}

export const TableCaption: React.FC<TableCaptionProps> = ({
  style,
  children,
}) => {
  return <Text style={[styles.captionText, style]}>{children}</Text>;
};

// --------------------------------------------------------------------------------
// Styles
// --------------------------------------------------------------------------------
const styles = StyleSheet.create({
  // Outermost container ensures horizontal scroll if needed
  tableContainer: {
    width: "100%",
    flexGrow: 1,
  },
  tableInner: {
    minWidth: "100%",
  },
  // Header section: each row as a View of cells
  headerContainer: {
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  // Body section
  bodyContainer: {
    // no extra styling
  },
  // Footer section: top border and muted background
  footerContainer: {
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F3F4F6", // muted/50
  },
  // Row container: bottom border, hover not supported
  rowContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  // Selected row background color
  rowSelected: {
    backgroundColor: "#F3F4F6", // muted
  },
  // Header cell: fixed height, padding, left‐aligned text
  headCell: {
    height: 48,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headCellCheckbox: {
    paddingRight: 0,
  },
  headText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280", // muted-foreground
  },
  // Body cell: padding, align middle
  cell: {
    padding: 16,
    justifyContent: "center",
  },
  cellCheckbox: {
    paddingRight: 0,
  },
  cellText: {
    fontSize: 14,
    color: "#111827", // default foreground
  },
  // Caption text: margin top, muted color
  captionText: {
    marginTop: 16,
    fontSize: 14,
    color: "#6B7280", // muted-foreground
    textAlign: "center",
  },
});
