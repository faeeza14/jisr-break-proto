/**
 * DS shim barrel — mirrors @jisr-hr/ds-web public API.
 *
 * This file is aliased to @jisr-hr/ds-web in vite.config.ts.
 * When the real package is available:
 *   1. npm install @jisr-hr/ds-web
 *   2. Remove the alias from vite.config.ts
 *   3. Remove this src/ds/ directory
 *
 * All exports match the real @jisr-hr/ds-web export names.
 */

// Atoms
export { Button } from './Button';
export type { } from './Button';

export { Switch } from './Switch';

export { Input, Textarea } from './Input';

export { Tag } from './Tag';

export { Badge } from './Badge';

export { Separator } from './Separator';

export { Tooltip } from './Tooltip';

export { Checkbox } from './Checkbox';

// Molecules
export { Card, CardSection } from './Card';

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from './Tabs';

export { Field } from './Field';

export { NumberInput } from './NumberInput';

export { RadioGroup, RadioGroupItem, SegmentedControl } from './RadioGroup';

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from './Dialog';

export {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
} from './Drawer';

export { Banner } from './Banner';

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './Accordion';

export { ToastProvider, useToast } from './Toast';

export {
  PageHeader,
  SmartBreadcrumb,
  MetadataItem,
} from './PageHeader';

export { SidebarNav } from './Sidebar';

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './Dropdown';

export { Item } from './Item';

export { Avatar, AvatarGroup } from './Avatar';

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
} from './Popover';

export { Skeleton, SkeletonCard, SkeletonText } from './Skeleton';

export { Empty } from './Empty';

export { Link } from './Link';

export { Progress } from './Progress';

export { Pagination } from './Pagination';

export { Slider } from './Slider';

export { InputGroup, InputGroupAddon, InputGroupInput } from './InputGroup';

export { Calendar } from './Calendar';
export type { DateRange } from './Calendar';

export { CalendarPopover } from './CalendarPopover';

// Organisms
export { Table } from './Table';
export type { TableColumn } from './Table';
