import { List } from '@components';
import { useTheme } from '@providers/Providers';

export default function InfoItem({ title }: { title: string }) {
  const theme = useTheme();
  return (
    <List.InfoItem title={title} icon="information-outline" theme={theme} />
  );
}
