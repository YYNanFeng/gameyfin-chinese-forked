import {useSnapshot} from "valtio/react";
import {gameState} from "Frontend/state/GameState";
import GameDto from "Frontend/generated/org/gameyfin/app/games/dto/GameDto";
import React from "react";
import CoverGrid from "Frontend/components/general/covers/CoverGrid";
import {useTranslation} from "react-i18next";

export default function RecentlyAddedView() {
    const {t} = useTranslation();
    const games = useSnapshot(gameState).recentlyAdded as GameDto[];

    return (
        <div className="flex flex-col gap-4">
            <p className="text-4xl font-bold text-center">{t('home.recentlyAdded')}</p>
            <CoverGrid games={games}/>
        </div>
    );
}