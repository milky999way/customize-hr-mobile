import * as Tabs from "@radix-ui/react-tabs";
import "./UITabs.scss";

type TabData = {
    value: string;
    label: string;
    disabled?: boolean;
    content: React.ReactNode;
};

type UITabsProps = React.ComponentProps<typeof Tabs.Root> & {
    tabsData: TabData[];
    listProps?: React.ComponentProps<typeof Tabs.List>;
    triggerProps?: React.ComponentProps<typeof Tabs.Trigger>;
    contentProps?: React.ComponentProps<typeof Tabs.Content>;
    onTabbed?: (e: any) => void;
};

export const UITabs = ({ tabsData, listProps, triggerProps, contentProps, onTabbed = () => {}, ...rootProps }: UITabsProps) => {
    const handleTabChange = (value: string) => {
        onTabbed(value)
    }
    return (
        <div className="tab__box">
            <Tabs.Root {...rootProps} className="tab__root" onValueChange={handleTabChange} defaultValue={tabsData[0]?.value}>
                <div className="tab__list">
                    <Tabs.List {...listProps}>
                        {tabsData.map((tab) => (
                            <Tabs.Trigger className={`tab ${tab.disabled ? "is-disabled" : ""}`} key={tab.value} value={tab.value} disabled={tab.disabled} {...triggerProps}>
                                {tab.label}
                            </Tabs.Trigger>
                        ))}
                    </Tabs.List>
                </div>
                {tabsData.map((tab) => (
                    <Tabs.Content className={`tab__content`} key={tab.value} value={tab.value} {...contentProps}>
                        {tab.content}
                    </Tabs.Content>
                ))}
            </Tabs.Root>
        </div>
    );
};
