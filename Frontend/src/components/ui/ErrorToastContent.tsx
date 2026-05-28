import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface ErrorToastContentProps {
	message: string | string[] | ReactNode;
}

export default function ErrorToastContent({ message }: ErrorToastContentProps) {
    const { t } = useTranslation();
	if (Array.isArray(message)) {
		return (
			<ul style={{ margin: 0, paddingLeft: "15px" }}>
				{message.map((msg, index) => (
					<li key={index}>{ t(msg) }</li>
				))}
			</ul>
		);
	}

	return <div>{ t(message) }</div>;
}
