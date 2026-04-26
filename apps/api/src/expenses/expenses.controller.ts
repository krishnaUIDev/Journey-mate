import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import * as Shared from '@journey-mate/shared';
import { ClerkGuard } from '../auth/clerk.guard';

@Controller('expenses')
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) { }

    @Get('journey/:journeyId')
    async findByJourney(@Param('journeyId') journeyId: string) {
        return this.expensesService.findByJourney(journeyId);
    }

    @Post()
    @UseGuards(ClerkGuard)
    async create(@Body() expense: Shared.Expense) {
        return this.expensesService.create(expense);
    }

    @Patch(':id')
    @UseGuards(ClerkGuard)
    async update(@Param('id') id: string, @Body() body: { payerId: string; updates: Partial<Shared.Expense> }) {
        return this.expensesService.update(id, body.payerId, body.updates);
    }

    @Delete(':id')
    @UseGuards(ClerkGuard)
    async remove(@Param('id') id: string, @Body('payerId') payerId: string) {
        return this.expensesService.remove(id, payerId);
    }
}
